
const notas = "";
// Función para leer y procesar el archivo MIDI
document.getElementById('midiFile').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Leer el archivo con FileReader
    const reader = new FileReader();
    reader.onload = async function(e) {
        const midiData = e.target.result;
        const notas = await parseMIDI(midiData); // Procesar los datos del MIDI
        console.log(notas);
        crearPartitura(notas);
    };
    reader.readAsArrayBuffer(file); // Leer como ArrayBuffer
});

// Función para analizar el archivo MIDI y extraer notas
async function parseMIDI(midiData) {
    // Crear un objeto MIDI a partir del ArrayBuffer
    const midi = new Midi(midiData);
    let notes = []; // Array para almacenar las notas en el formato correcto

    // Tomar las notas de la primera pista
    midi.tracks.forEach(track => {
        track.notes.forEach(note => {
            // Separar la letra de la octava y convertir a formato "c/4/q"
            const noteName = note.name.slice(0, -1).toLowerCase(); // Nota en minúsculas
            const octave = note.name.slice(-1); // Último carácter es la octava
            notes.push(`${noteName}/${octave}/q`);
        });
    });

    return notes; // Devuelve el array formateado correctamente
}



const { Stave, StaveNote, Formatter, Renderer } = Vex;

// Crear un renderer SVG y adjuntarlo al DIV con id="output".
const div = document.getElementById("output");

const renderer = new Renderer(div, Renderer.Backends.SVG);

// Configurar el contexto de renderizado.
renderer.resize(800, 150);
const context = renderer.getContext();

function crearPartitura(notas){
    context.clear();   //Limpia el pentagrama antes de dibujar uno nuevo

    const notasPorCompas = 4; // Cuatro notas por compás
    const compases = [];
    for (let i = 0; i < notas.length; i += notasPorCompas) {
        compases.push(notas.slice(i, i + notasPorCompas));
    }

    // Dibujar cada compás
    let x = 10;
    compases.forEach((compasNotas, index) => {
        const stave = new Stave(x, 0, 150);
        if (index === 0) stave.addClef("treble"); // Agregar clave solo en el primer compás
        stave.setContext(context).draw();

        // Convertir notas a StaveNote correctamente
        const notasCompas = compasNotas.map(n => {
            const [nota, octava, duracion] = n.split("/");
            return new StaveNote({ keys: [`${nota.toLowerCase()}/${octava}`], duration: duracion });
        });

        Formatter.FormatAndDraw(context, stave, notasCompas);
        x += 160; // Ajustar la posición para el siguiente compás
    });
}