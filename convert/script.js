const copyToClipboard = value => {
  if (navigator && navigator.clipboard && navigator.clipboard.writeText && typeof value === 'string') {
    return navigator.clipboard.writeText(value);
  }
  if (navigator && navigator.clipboard && navigator.clipboard.write && typeof value === 'object') {
    return navigator.clipboard.write(value);
  }
  return Promise.reject('The Clipboard API is not available.');
};

function pasteFromClipboard() {
  if (navigator && navigator.clipboard && navigator.clipboard.readText) {
    return navigator.clipboard.readText();
  }
  return Promise.reject('The Clipboard API is not available.');
}

function getBase64(file) {
  return new Promise((resolve, reject) => {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      return resolve(reader.result);
    };
    reader.onerror = function (error) {
      return reject(error);
    };
  });
}

document.onreadystatechange = function () {
  const source = document.getElementById('source');
  const result = document.getElementById('result');
  const resultImg = document.getElementById('result-img');
  const resultAudio = document.getElementById('result-audio');
  const resultVideo = document.getElementById('result-video');
  const resultVideoSource = document.getElementById('result-video-source');
  const openSourceFile = document.getElementById('open-source-file');
  const encodeBtn = document.getElementById('encode-btn');
  const decodeBtn = document.getElementById('decode-btn');
  const decodeImage = document.getElementById('decode-image-btn');
  const decodeAudio = document.getElementById('decode-audio-btn');
  const decodeVideo = document.getElementById('decode-video-btn');
  const copyResult = document.getElementById('copy-result');
  const copySource = document.getElementById('copy-source');
  const pasteSource = document.getElementById('paste-source');
  const clearSource = document.getElementById('clear-source');
  const clearResult = document.getElementById('clear-result');
  const saveResult = document.getElementById('save-result');
  const query = new URLSearchParams(window.location.search);
  const text = query.get('text');

  let resultType = 'text';

  source.value = text || '';

  if(source.value.length > 0) {
    decodeBtn.classList.remove('disabled');
    encodeBtn.classList.remove('disabled');
    decodeImage.classList.remove('disabled');
    decodeAudio.classList.remove('disabled');
    decodeVideo.classList.remove('disabled');
  }

  if (text && text.startsWith('[from]')) {
    source.value = text.substring(7);
    decodeBtn.click();
  }

  if (text && text.startsWith('[to]')) {
    source.value = text.substring(5);
    encodeBtn.click();
  }

  resultImg.style.display = 'none';
  resultAudio.style.display = 'none';
  resultVideo.style.display = 'none';

  openSourceFile.onclick = () => {
    let input = document.createElement('input');
    input.type = 'file';
    input.onchange = async () => {
      let files = Array.from(input.files);
      if (files.length > 0) {
        const base64 = await getBase64(files[0]);
        result.value = base64.replace('data:text/plain;base64,', '');
      }
    };
    input.click();
  }

  encodeBtn.onclick = (event) => {
    if (event.currentTarget.classList.contains('disabled')) {
      return;
    }
    let encodedText;
    const text = source.value;
    try {
      encodedText = btoa(text);
    } catch (err) {
      encodedText = btoa(encodeURIComponent(text));
    }
    result.value = encodedText;
    result.style.display = 'block';
    resultImg.src = null;
    resultImg.style.display = 'none';
    resultAudio.style.display = 'none';
    resultVideo.style.display = 'none';
    resultType = 'text';
    copyResult.classList.remove('disabled');
  };

  decodeBtn.onclick = (event) => {
    if (event.currentTarget.classList.contains('disabled')) {
      return;
    }
    const base64 = source.value;
    try {
      result.value = decodeURIComponent(atob(base64));
    }
    catch (err) {
      result.value = atob(base64);
    }
    result.style.display = 'block';
    resultImg.style.display = 'none';
    resultAudio.style.display = 'none';
    resultVideo.style.display = 'none';
    resultVideo.style.display = 'none';
    resultType = 'text';
    copyResult.classList.remove('disabled');
  };

  decodeImage.onclick = (event) => {
    if (event.currentTarget.classList.contains('disabled')) {
      return;
    }
    const base64 = source.value.replace(/data:image\/.+?;base64,/, '');
    resultImg.src = `data:image/jpeg;base64,${base64}`;
    result.style.display = 'none';
    resultImg.style.display = 'block';
    resultAudio.style.display = 'none';
    resultVideo.style.display = 'none';
    resultVideo.style.display = 'none';
    resultType = 'image';
    copyResult.classList.add('disabled');
  };

  decodeAudio.onclick = (event) => {
    if (event.currentTarget.classList.contains('disabled')) {
      return;
    }
    const base64 = source.value.replace(/data:audio\/.+?;base64,/, '');
    resultAudio.src = `data:audio/mp3;base64,${base64}`;
    result.style.display = 'none';
    resultImg.style.display = 'none';
    resultAudio.style.display = 'block';
    resultVideo.style.display = 'none';
    resultType = 'audio';
    copyResult.classList.add('disabled');
  };

  decodeVideo.onclick = (event) => {
    if (event.currentTarget.classList.contains('disabled')) {
      return;
    }
    const base64 = source.value.replace(/data:video\/.+?;base64,/, '');
    resultVideoSource.src = `data:video/mp4;base64,${base64}`;
    result.style.display = 'none';
    resultImg.style.display = 'none';
    resultAudio.style.display = 'none';
    resultVideo.style.display = 'block';
    resultVideo.load();
    resultType = 'video';
    copyResult.classList.add('disabled');
  };

  source.onkeyup = (event) => {
    if (event.target.value) {
      decodeBtn.classList.remove('disabled');
      encodeBtn.classList.remove('disabled');
      decodeImage.classList.remove('disabled');
      decodeAudio.classList.remove('disabled');
      decodeVideo.classList.remove('disabled');
    } else {
      decodeBtn.classList.add('disabled');
      encodeBtn.classList.add('disabled');
      decodeImage.classList.add('disabled');
      decodeAudio.classList.add('disabled');
      decodeVideo.classList.add('disabled');
    }
  };

  copySource.onclick = () => copyToClipboard(source.value);

  pasteSource.onclick = async () => {
    const text = await pasteFromClipboard();
    source.value = text;
    source.dispatchEvent(new Event('keyup'));
  };

  clearSource.onclick = () => {
    source.value = '';
    source.dispatchEvent(new Event('keyup'));
  }

  clearResult.onclick = (event) => {
    if (event.currentTarget.classList.contains('disabled')) {
      return;
    }
    result.value = '';
    resultImg.src = null;
    resultAudio.src = null;
    resultVideoSource.src = null;
    result.style.display = 'block';
    resultImg.style.display = 'none';
    resultAudio.style.display = 'none';
    resultVideo.style.display = 'none';
    resultVideo.style.display = 'none';
    resultType = 'text';
  }

  saveResult.onclick = (event) => {
    if (event.currentTarget.classList.contains('disabled')) {
      return;
    }
    if (resultType === 'text') {
      const blob = new Blob([result.value], { type: 'text/plain' });
      saveAs(blob, "text.txt");
    }
    if (resultType === 'image') {
      saveAs(resultImg.src, "image.jpeg");
    }
    if (resultType === 'audio') {
      saveAs(resultAudio.src, "audio.mp3");
    }
    if (resultType === 'video') {
      alert('Video is not supported yet.');
    }
  };

  copyResult.onclick = (event) => {
    if (event.currentTarget.classList.contains('disabled')) {
      return;
    }
    if (resultType === 'text') {
      copyToClipboard(result.value);
    }
    if (resultType === 'image') {
      alert('Image is not copyable. Please use context menu.');
    }
    if (resultType === 'audio') {
      alert('Audio is not copyable. Please use context menu.');
    }
    if (resultType === 'video') {
      alert('Video is not copyable. Please use context menu.');
    }
  }
};