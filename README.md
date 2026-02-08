# WebShader IDE

**[Live Demo](https://my-web-shader.vercel.app)**

**[Github Repo](https://github.com/EmileThv/my-web-shader)**

The idea for this project was to make a web IDE for GLSL featuring real-time rendering. uses CodeMirror 6 for the editor ( i didn't want to use Monaco because it felt too heavy, so the IDE is missing some features like Intellisense etc...). 
Uses some pretty basic three.js code for rendering and GPU acceleration.
I tried to make it responsive but it doesn't work the way I want currently so I'll fix that. 

This project is heavily inspired by the incredible work of **Patricio Gonzalez Vivo** and his editor for [The Book of Shaders](https://thebookofshaders.com/). I highly recommend giving the book a read if you're interested in shaders and GLSL, it's really great.

## Tech Stack 

Three.js , CodeMirror 6, Vite.js ( for bundling ), Vercel ( for hosting )

## To run this locally 

Clone the git repo : 
`git clone https://github.com/EmileThv/my-web-shader.git`

Install project dependencies : 
`npm install`

Start the dev server : 
`npm run dev`

