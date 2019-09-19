AOS.init({
	duration: 800,
	easing: 'slide',
	once: false
});

let selectedLabel = 'apple';

const ACCESS_TOKEN ='ya29.c.ElqIB558uHMpUq5TyAa14W4EBpV_3DAFmJviiH3qwkvfx-PelFKFtoBNJEowVQ5e_igvBfiP8x7NmH30xKEJZbqEQlIu-QRC9aVZhj6VrlDvHo6OlY0fqVx9b9Q';

const SERVICE_URLS = {
  apple: 'https://automl.googleapis.com/v1beta1/projects/seetree-proto/locations/us-central1/models/ICN1440172913436022232:predict',
  banana: 'https://automl.googleapis.com/v1beta1/projects/seetree-proto/locations/us-central1/models/ICN6655218589140412460:predict'
};

$('#image-input').change((e) => {
  const file = $('#image-input')[0].files[0];
  previewFile(file);
  $('#result').html('');
});

const $labelSelect = $('#label-select');
$labelSelect.change(() => {
  selectedLabel = $labelSelect.val();
});


$('#submit').click(() => {
  const file = $('#image-input')[0].files[0];

  const reader = new FileReader();
  reader.onload = function() {
    const arrayBuffer = this.result;
    const base64String = btoa(String.fromCharCode.apply(null, new Uint8Array(arrayBuffer)));
    getAutoMLPrediction(base64String)
  };
  reader.readAsArrayBuffer(file);
});


function previewFile(file) {
  const preview = $('#preview-image');
  const $imageContainer = $('.image-container');
  const reader  = new FileReader();

  reader.onload = () => {
    preview.attr('src', reader.result);
    $imageContainer.show();
  };

  if (file) {
    reader.readAsDataURL(file);
  }
}

/*
curl -X POST -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(gcloud auth application-default print-access-token)" \
  https://automl.googleapis.com/v1beta1/projects/seetree-proto/locations/us-central1/models/ICN1440172913436022232:predict -d @request.json
* */

function renderResult(data) {
  const $result = $('#result');

  const result = data.payload[0];
  // language=HTML
  $result.html(`
    <h1 class="title">${result.displayName}</h1>
    <div class="percent">score: ${result.classification.score}</div>
  `)
}

function getAutoMLPrediction(imageBytes) {
  const $loader = $('.loader-container');

  const url = SERVICE_URLS[selectedLabel];

  $loader.show();
  window.fetch(url, {
    method: 'post',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: prepareImageData(imageBytes)
  })
    .then(response => response.json())
    .then(function (data) {
      console.log('Request succeeded with JSON response', data);
      if (data.error) {
        alert(JSON.stringify(data.error));
      }
      renderResult(data);
    })
    .catch(function (error) {
      console.log('Request failed', error);
    }).finally(() => $loader.hide())
}

function prepareImageData(imageBytes) {
  const imageData = {
    "payload": {
      "image": {
        "imageBytes": imageBytes
      }
    }
  };

  return JSON.stringify(imageData);
}
