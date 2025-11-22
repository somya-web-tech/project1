// 10-sec front-camera recorder returns {blob, base64}
async function record10s() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "user" },
    audio: true
  });
  const preview = document.getElementById('preview');
  preview.srcObject = stream;
  preview.play();

  const rec = new MediaRecorder(stream, { mimeType: 'video/webm' });
  const chunks = [];
  rec.ondataavailable = e => chunks.push(e.data);
  rec.start();

  return new Promise(resolve => {
    rec.onstop = async () => {
      stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(chunks, { type: 'video/webm' });
      const reader = new FileReader();
      reader.onloadend = () => resolve({ blob, base64: reader.result.split(',')[1] });
      reader.readAsDataURL(blob);
    };
    setTimeout(() => rec.stop(), 10_000);
  });
}
