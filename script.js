const video = document.getElementById('video');
const statusText = document.getElementById('status');
const lockScreen = document.getElementById('lockScreen');
const registerBtn = document.getElementById('registerBtn');
let labeledDescriptors = [];
const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights'\;

async function startApp() {
    try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        const saved = localStorage.getItem('ownerFace');
        if (saved) {
            const data = JSON.parse(saved);
            const desc = new Float32Array(Object.values(data.descriptors[0]));
            labeledDescriptors = [new faceapi.LabeledFaceDescriptors('Owner', [desc])];
            statusText.innerText = "AI Ready.";
        }
        navigator.mediaDevices.getUserMedia({ video: true }).then(s => video.srcObject = s);
    } catch (err) { statusText.innerText = "Error loading models."; }
}
registerBtn.addEventListener('click', async () => {
    const d = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
    if (d) {
        labeledDescriptors = [new faceapi.LabeledFaceDescriptors('Owner', [d.descriptor])];
        localStorage.setItem('ownerFace', JSON.stringify(labeledDescriptors[0]));
        alert("Registered!");
    }
});
video.addEventListener('play', () => {
    setInterval(async () => {
        if (labeledDescriptors.length === 0) return;
        const det = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
        const matcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
        const res = det.map(d => matcher.findBestMatch(d.descriptor));
        const isOwner = res.some(r => r.label === 'Owner');
        lockScreen.style.display = isOwner ? 'none' : 'flex';
    }, 1000);
});
startApp();
