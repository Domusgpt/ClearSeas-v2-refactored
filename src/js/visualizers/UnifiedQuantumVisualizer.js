/**
 * Unified Quantum Visualizer
 * Based on VIB3+ Engine architecture with 6D rotation and 8 geometry types
 *
 * Features:
 * - 6D rotation support (XY, XZ, YZ, XW, YW, ZW)
 * - 8 geometry types (Tetrahedron, Hypercube, Sphere, Torus, Klein Bottle, Fractal, Wave, Crystal)
 * - Role-based intensity system (background/shadow/content/highlight/accent)
 * - Scroll-responsive parameter updates
 * - Optimized single-pass rendering (no triple RGB calculation)
 */

export class UnifiedQuantumVisualizer {
    constructor(canvasId, options = {}) {
        this.canvasId = canvasId;
        this.canvas = document.getElementById(canvasId);

        if (!this.canvas) {
            console.error(`Canvas ${canvasId} not found`);
            return;
        }

        // Configuration
        this.role = options.role || 'content';  // background/shadow/content/highlight/accent
        this.depth = options.depth || 0.5;      // Parallax depth (0=back, 1=front)
        this.reactivity = options.reactivity || 1.0;

        // 14 Parameters (11 visual + 3 additional 4D rotations)
        this.params = {
            geometry: options.geometry || 0,      // 0-7 geometry types
            gridDensity: options.gridDensity || 15,
            morphFactor: options.morphFactor || 1.0,
            chaos: options.chaos || 0.2,
            speed: options.speed || 1.0,
            hue: options.hue || 180,
            intensity: options.intensity || 0.5,
            saturation: options.saturation || 0.8,
            // 6D Rotation parameters
            rot4dXY: 0.0,  // 3D space rotations
            rot4dXZ: 0.0,
            rot4dYZ: 0.0,
            rot4dXW: 0.0,  // 4D hyperspace rotations
            rot4dYW: 0.0,
            rot4dZW: 0.0
        };

        // Interaction state
        this.mouseX = 0.5;
        this.mouseY = 0.5;
        this.mouseIntensity = 0.0;
        this.clickIntensity = 0.0;

        // Time tracking
        this.startTime = Date.now();

        // Initialize WebGL
        this.initWebGL();
    }

    /**
     * Initialize WebGL context and compile shaders
     */
    initWebGL() {
        // Get canvas dimensions
        const rect = this.canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;

        // Create WebGL context
        const contextOptions = {
            alpha: true,
            depth: false,
            stencil: false,
            antialias: false,
            premultipliedAlpha: true,
            preserveDrawingBuffer: false,
            powerPreference: 'high-performance'
        };

        this.gl = this.canvas.getContext('webgl2', contextOptions) ||
                  this.canvas.getContext('webgl', contextOptions) ||
                  this.canvas.getContext('experimental-webgl', contextOptions);

        if (!this.gl) {
            console.error('WebGL not supported for', this.canvasId);
            return;
        }

        // Compile shaders
        this.compileShaders();
        this.initBuffers();

        console.log(`✅ UnifiedQuantumVisualizer initialized: ${this.canvasId} (${this.role})`);
    }

    /**
     * Compile VIB3+ shader system with 6D rotations and 8 geometries
     */
    compileShaders() {
        const vertexShaderSource = `
            attribute vec2 a_position;
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;

        const fragmentShaderSource = `
            precision highp float;

            uniform vec2 u_resolution;
            uniform float u_time;
            uniform vec2 u_mouse;
            uniform float u_geometry;
            uniform float u_gridDensity;
            uniform float u_morphFactor;
            uniform float u_chaos;
            uniform float u_speed;
            uniform float u_hue;
            uniform float u_intensity;
            uniform float u_saturation;
            uniform float u_rot4dXY;
            uniform float u_rot4dXZ;
            uniform float u_rot4dYZ;
            uniform float u_rot4dXW;
            uniform float u_rot4dYW;
            uniform float u_rot4dZW;
            uniform float u_mouseIntensity;
            uniform float u_clickIntensity;
            uniform float u_roleIntensity;
            uniform float u_scrollProgress;

            // VIB3+ 6D Rotation Matrices

            // 3D Space rotations (XY, XZ, YZ)
            mat4 rotateXY(float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat4(c, -s, 0.0, 0.0, s, c, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0);
            }

            mat4 rotateXZ(float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat4(c, 0.0, s, 0.0, 0.0, 1.0, 0.0, 0.0, -s, 0.0, c, 0.0, 0.0, 0.0, 0.0, 1.0);
            }

            mat4 rotateYZ(float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat4(1.0, 0.0, 0.0, 0.0, 0.0, c, -s, 0.0, 0.0, s, c, 0.0, 0.0, 0.0, 0.0, 1.0);
            }

            // 4D Hyperspace rotations (XW, YW, ZW)
            mat4 rotateXW(float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat4(c, 0.0, 0.0, -s, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, s, 0.0, 0.0, c);
            }

            mat4 rotateYW(float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat4(1.0, 0.0, 0.0, 0.0, 0.0, c, 0.0, -s, 0.0, 0.0, 1.0, 0.0, 0.0, s, 0.0, c);
            }

            mat4 rotateZW(float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat4(1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, c, -s, 0.0, 0.0, s, c);
            }

            // Project 4D to 3D
            vec3 project4Dto3D(vec4 p) {
                float w = 2.5 / (2.5 + p.w);
                return vec3(p.x * w, p.y * w, p.z * w);
            }

            // VIB3+ 8 Geometry Types
            float geometryFunction(vec4 p) {
                int geomType = int(u_geometry);

                // Uniform grid density for all geometries
                float density = u_gridDensity * 0.08;

                if (geomType == 0) {
                    // TETRAHEDRON - Simple 4-vertex lattice
                    vec4 pos = fract(p * density);
                    vec4 dist = min(pos, 1.0 - pos);
                    return min(min(dist.x, dist.y), min(dist.z, dist.w)) * u_morphFactor;
                }
                else if (geomType == 1) {
                    // HYPERCUBE - 4D cube projection
                    vec4 pos = fract(p * density);
                    vec4 dist = min(pos, 1.0 - pos);
                    float minDist = min(min(dist.x, dist.y), min(dist.z, dist.w));
                    return minDist * u_morphFactor;
                }
                else if (geomType == 2) {
                    // SPHERE - Radial harmonic sphere
                    float r = length(p);
                    float spheres = abs(fract(r * density) - 0.5) * 2.0;
                    float theta = atan(p.y, p.x);
                    float harmonics = sin(theta * 3.0) * 0.2;
                    return (spheres + harmonics) * u_morphFactor;
                }
                else if (geomType == 3) {
                    // TORUS - Toroidal field
                    float r1 = length(p.xy) - 2.0;
                    float torus = length(vec2(r1, p.z)) - 0.8;
                    float lattice = sin(p.x * density) * sin(p.y * density);
                    return (torus + lattice * 0.3) * u_morphFactor;
                }
                else if (geomType == 4) {
                    // KLEIN BOTTLE - Non-orientable surface
                    float u = atan(p.y, p.x);
                    float v = atan(p.w, p.z);
                    float dist = length(p) - 2.0;
                    float lattice = sin(u * density) * sin(v * density);
                    return (dist + lattice * 0.4) * u_morphFactor;
                }
                else if (geomType == 5) {
                    // FRACTAL - Recursive subdivision
                    vec4 pos = fract(p * density);
                    pos = abs(pos * 2.0 - 1.0);
                    float dist = length(max(abs(pos) - 1.0, 0.0));
                    return dist * u_morphFactor;
                }
                else if (geomType == 6) {
                    // WAVE - Sinusoidal interference
                    float time = u_time * 0.001 * u_speed;
                    float wave1 = sin(p.x * density + time);
                    float wave2 = sin(p.y * density + time * 1.3);
                    float wave3 = sin(p.z * density * 0.8 + time * 0.7);
                    float interference = wave1 * wave2 * wave3;
                    return interference * u_morphFactor;
                }
                else if (geomType == 7) {
                    // CRYSTAL - Octahedral structure
                    vec4 pos = fract(p * density) - 0.5;
                    float cube = max(max(abs(pos.x), abs(pos.y)), max(abs(pos.z), abs(pos.w)));
                    return cube * u_morphFactor;
                }
                else {
                    // Default: Hypercube
                    vec4 pos = fract(p * density);
                    vec4 dist = min(pos, 1.0 - pos);
                    return min(min(dist.x, dist.y), min(dist.z, dist.w)) * u_morphFactor;
                }
            }

            // HSV to RGB conversion
            vec3 hsv2rgb(float h, float s, float v) {
                vec3 c = vec3(h, s, v);
                vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
                vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
                return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
            }

            void main() {
                vec2 uv = (gl_FragCoord.xy - u_resolution.xy * 0.5) / min(u_resolution.x, u_resolution.y);

                // 4D position with time evolution and scroll influence
                float timeSpeed = u_time * 0.0001 * u_speed;
                float scrollInfluence = u_scrollProgress * 0.5;
                vec4 pos = vec4(uv * 3.0, sin(timeSpeed * 3.0 + scrollInfluence), cos(timeSpeed * 2.0 + scrollInfluence));

                // Mouse interaction
                pos.xy += (u_mouse - 0.5) * u_mouseIntensity * 2.0;

                // Apply 6D rotations in sequence (3D space first, then 4D hyperspace)
                pos = rotateXY(u_rot4dXY) * pos;
                pos = rotateXZ(u_rot4dXZ) * pos;
                pos = rotateYZ(u_rot4dYZ) * pos;
                pos = rotateXW(u_rot4dXW) * pos;
                pos = rotateYW(u_rot4dYW) * pos;
                pos = rotateZW(u_rot4dZW) * pos;

                // Calculate geometry value
                float value = geometryFunction(pos);

                // Apply chaos/noise
                float noise = sin(pos.x * 7.0) * cos(pos.y * 11.0) * sin(pos.z * 13.0);
                value += noise * u_chaos;

                // Calculate intensity from geometry
                float geometryIntensity = 1.0 - clamp(abs(value), 0.0, 1.0);
                geometryIntensity += u_clickIntensity * 0.3;

                // Apply user intensity control
                float finalIntensity = geometryIntensity * u_intensity;

                // Color calculation
                float hue = u_hue / 360.0 + value * 0.1;
                vec3 color = hsv2rgb(hue, u_saturation, finalIntensity);

                // Role-based intensity modulation
                float alpha = finalIntensity * u_roleIntensity;

                gl_FragColor = vec4(color, alpha);
            }
        `;

        // Compile shaders
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

        if (!vertexShader || !fragmentShader) {
            console.error('Shader compilation failed');
            return;
        }

        // Link program
        this.program = this.gl.createProgram();
        this.gl.attachShader(this.program, vertexShader);
        this.gl.attachShader(this.program, fragmentShader);
        this.gl.linkProgram(this.program);

        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            console.error('Program link error:', this.gl.getProgramInfoLog(this.program));
            return;
        }

        // Get uniform locations
        this.uniforms = {
            resolution: this.gl.getUniformLocation(this.program, 'u_resolution'),
            time: this.gl.getUniformLocation(this.program, 'u_time'),
            mouse: this.gl.getUniformLocation(this.program, 'u_mouse'),
            geometry: this.gl.getUniformLocation(this.program, 'u_geometry'),
            gridDensity: this.gl.getUniformLocation(this.program, 'u_gridDensity'),
            morphFactor: this.gl.getUniformLocation(this.program, 'u_morphFactor'),
            chaos: this.gl.getUniformLocation(this.program, 'u_chaos'),
            speed: this.gl.getUniformLocation(this.program, 'u_speed'),
            hue: this.gl.getUniformLocation(this.program, 'u_hue'),
            intensity: this.gl.getUniformLocation(this.program, 'u_intensity'),
            saturation: this.gl.getUniformLocation(this.program, 'u_saturation'),
            rot4dXY: this.gl.getUniformLocation(this.program, 'u_rot4dXY'),
            rot4dXZ: this.gl.getUniformLocation(this.program, 'u_rot4dXZ'),
            rot4dYZ: this.gl.getUniformLocation(this.program, 'u_rot4dYZ'),
            rot4dXW: this.gl.getUniformLocation(this.program, 'u_rot4dXW'),
            rot4dYW: this.gl.getUniformLocation(this.program, 'u_rot4dYW'),
            rot4dZW: this.gl.getUniformLocation(this.program, 'u_rot4dZW'),
            mouseIntensity: this.gl.getUniformLocation(this.program, 'u_mouseIntensity'),
            clickIntensity: this.gl.getUniformLocation(this.program, 'u_clickIntensity'),
            roleIntensity: this.gl.getUniformLocation(this.program, 'u_roleIntensity'),
            scrollProgress: this.gl.getUniformLocation(this.program, 'u_scrollProgress')
        };
    }

    /**
     * Create and compile shader
     */
    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    /**
     * Initialize vertex buffers
     */
    initBuffers() {
        const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);

        this.buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);

        const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
    }

    /**
     * Update visualization parameters
     */
    updateParameters(params) {
        this.params = { ...this.params, ...params };
    }

    /**
     * Update mouse interaction
     */
    updateInteraction(x, y, intensity) {
        this.mouseX = x;
        this.mouseY = y;
        this.mouseIntensity = intensity;
    }

    /**
     * Render frame
     */
    render(context) {
        if (!this.program || !this.gl) return;

        const { scroll } = context || { scroll: 0 };

        // Resize if needed
        this.resize();

        // Clear and setup
        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.useProgram(this.program);

        // Role-specific intensity
        const roleIntensities = {
            'background': 0.3,
            'shadow': 0.5,
            'content': 0.8,
            'highlight': 1.0,
            'accent': 1.2
        };

        const time = Date.now() - this.startTime;

        // Set uniforms
        this.gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
        this.gl.uniform1f(this.uniforms.time, time);
        this.gl.uniform2f(this.uniforms.mouse, this.mouseX, this.mouseY);
        this.gl.uniform1f(this.uniforms.geometry, this.params.geometry);
        this.gl.uniform1f(this.uniforms.gridDensity, this.params.gridDensity);
        this.gl.uniform1f(this.uniforms.morphFactor, this.params.morphFactor);
        this.gl.uniform1f(this.uniforms.chaos, this.params.chaos);
        this.gl.uniform1f(this.uniforms.speed, this.params.speed);
        this.gl.uniform1f(this.uniforms.hue, this.params.hue);
        this.gl.uniform1f(this.uniforms.intensity, this.params.intensity);
        this.gl.uniform1f(this.uniforms.saturation, this.params.saturation);
        this.gl.uniform1f(this.uniforms.rot4dXY, this.params.rot4dXY || 0.0);
        this.gl.uniform1f(this.uniforms.rot4dXZ, this.params.rot4dXZ || 0.0);
        this.gl.uniform1f(this.uniforms.rot4dYZ, this.params.rot4dYZ || 0.0);
        this.gl.uniform1f(this.uniforms.rot4dXW, this.params.rot4dXW || 0.0);
        this.gl.uniform1f(this.uniforms.rot4dYW, this.params.rot4dYW || 0.0);
        this.gl.uniform1f(this.uniforms.rot4dZW, this.params.rot4dZW || 0.0);
        this.gl.uniform1f(this.uniforms.mouseIntensity, this.mouseIntensity);
        this.gl.uniform1f(this.uniforms.clickIntensity, this.clickIntensity);
        this.gl.uniform1f(this.uniforms.roleIntensity, roleIntensities[this.role] || 1.0);
        this.gl.uniform1f(this.uniforms.scrollProgress, scroll);

        // Draw
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

        // Decay click intensity
        this.clickIntensity *= 0.9;
    }

    /**
     * Resize canvas and viewport
     */
    resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;

        if (this.canvas.width !== width * dpr || this.canvas.height !== height * dpr) {
            this.canvas.width = width * dpr;
            this.canvas.height = height * dpr;
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    /**
     * Trigger click effect
     */
    triggerClick() {
        this.clickIntensity = 1.0;
    }

    /**
     * Clean up WebGL resources
     */
    dispose() {
        if (this.gl && this.program) {
            this.gl.deleteProgram(this.program);
        }
        if (this.gl && this.buffer) {
            this.gl.deleteBuffer(this.buffer);
        }
    }
}
