import * as THREE from 'three';
import { EditorView, basicSetup } from "codemirror";
import { cpp } from "@codemirror/lang-cpp"; // C++ syntax is basically identical to GLSL

//1. The engine 

// Renderer Setup
const canvas = document.getElementById('gl-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

const container = document.getElementById('render-container');

const width = container.clientWidth;
const height = container.clientHeight;


renderer.setSize(width, height);

const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const scene = new THREE.Scene();

const geometry = new THREE.PlaneGeometry(2,2);

//2. Data Bridge

// uniforms
const uniforms = {
  u_time: { value: 0.0 },
  u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  u_mouse: { value: new THREE.Vector2(0, 0) }
};

const vertexShader = `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

// classic default text
const initialFragmentShader = `

uniform float u_time;
uniform vec2 u_resolution;

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.y, u_resolution.x);

    for(float i = 1.0; i < 10.0; i++){
        uv.x += 0.6 / i * cos(i * uv.y + u_time*.1 + i);
        uv.y += 0.6 / i * tan(i * uv.x + u_time*.1 + i);
    }

    vec3 color = vec3(0.5 + 0.5 * sin(u_time*.1 + uv.x), 
                      0.5 + 0.5 * cos(u_time*.1+ uv.y), 
                      0.8);

    gl_FragColor = vec4(color / length(uv), 1.0);
}`;

// make a material out of the shader
const material = new THREE.ShaderMaterial({
  uniforms: uniforms,
  vertexShader: vertexShader,
  fragmentShader: initialFragmentShader
});

// put the shader on a mesh of the correct geometry and add it to the three.js scene
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

//3. Codemirror (IDE) set up
// this was made by gemini so might be not so good
const editor = new EditorView({
  doc: initialFragmentShader, // Load the shader string we defined above
  extensions: [
    basicSetup,
    cpp(), // Syntax highlighting
    EditorView.updateListener.of((update) => {
      // This runs every time you type a character
      if (update.docChanged) {
        // 1. Get the new text
        const newShader = update.state.doc.toString();
        
        // 2. Send it to Three.js
        material.fragmentShader = newShader;
        
        // 3. Tell the GPU to re-compile
        material.needsUpdate = true;
      }
    })
  ],
  parent: document.getElementById('editor-container') // Inject into HTML
});

//4. Render loop

// animation loop
function animate(time) {
    // 'time' comes in seconds
    uniforms.u_time.value = time * 0.01;
    
    // Draw the scene
    renderer.render(scene, camera);
    
    // Loop
    requestAnimationFrame(animate);
}

// window resizing
window.addEventListener('resize', handleResize);

function handleResize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    
    // Update the renderer to the actual pixel size of the box
    renderer.setSize(w, h, false); // 'false' prevents CSS scaling issues
    
    // Update the shader uniform
    uniforms.u_resolution.value.set(w, h);
}

handleResize();

// start the loop
requestAnimationFrame(animate);






