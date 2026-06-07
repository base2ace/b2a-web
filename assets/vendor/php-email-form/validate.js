/**
* PHP Email Form Validation - v3.10
* URL: https://bootstrapmade.com/php-email-form/
* Author: BootstrapMade.com
*/
(function () {
  "use strict";

  let forms = document.querySelectorAll('.php-email-form');

  forms.forEach( function(e) {
    e.addEventListener('submit', function(event) {
      event.preventDefault();

      let thisForm = this;

      let action = thisForm.getAttribute('action');
      let recaptcha = thisForm.getAttribute('data-recaptcha-site-key');
      
      if( ! action ) {
        displayError(thisForm, 'The form action property is not set!');
        return;
      }
      thisForm.querySelector('.loading').classList.add('d-block');
      thisForm.querySelector('.error-message').classList.remove('d-block');
      thisForm.querySelector('.sent-message').classList.remove('d-block');

      let formData = new FormData( thisForm );

      if ( recaptcha ) {
        if(typeof grecaptcha !== "undefined" ) {
          grecaptcha.ready(function() {
            try {
              grecaptcha.execute(recaptcha, {action: 'php_email_form_submit'})
              .then(token => {
                formData.set('recaptcha-response', token);
                php_email_form_submit(thisForm, action, formData);
              })
            } catch(error) {
              displayError(thisForm, error);
            }
          });
        } else {
          displayError(thisForm, 'The reCaptcha javascript API url is not loaded!')
        }
      } else {
        php_email_form_submit(thisForm, action, formData);
      }
    });
  });

function php_email_form_submit(thisForm, action, formData) {
  // FormSubmit requires a web server to function properly
  if (window.location.protocol === 'file:') {
    displayError(thisForm, 'FormSubmit does not support submitting forms from pages browsed as local HTML files (file://). Please open this page through a local web server (e.g., Live Server in VS Code, or by running a local server in the project folder).');
    return;
  }

  // Check if running on GitHub Pages, local file, or local dev server without PHP parser
  const isStaticHost = (window.location.hostname.includes('github.io') || 
                        (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost')) &&
                       !action.includes('formsubmit.co');

  if (isStaticHost) {
    // Simulate static form submission success
    setTimeout(() => {
      thisForm.querySelector('.loading').classList.remove('d-block');
      const successMessage = thisForm.querySelector('.sent-message');
      successMessage.classList.add('d-block');
      thisForm.reset();
      
      // Log form data for debugging/demonstration
      console.log('Static host detected. Simulated form submission success with data:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      setTimeout(() => {
        successMessage.classList.add('fade');
        setTimeout(() => {
          successMessage.classList.remove('d-block', 'fade');
        }, 500);
      }, 4500);
    }, 1000);
    return;
  }

  fetch(action, {
    method: 'POST',
    body: formData,
    headers: {'X-Requested-With': 'XMLHttpRequest'}
  })
  .then(response => {
    if (response.ok) {
      return response.json(); // Changed from text() to json()
    } else {
      throw new Error(`${response.status} ${response.statusText} ${response.url}`); 
    }
  })
  .then(data => {
    thisForm.querySelector('.loading').classList.remove('d-block');
   
    if (data.status === 'success' || data.success === 'true' || data.success === true) {
      const successMessage = thisForm.querySelector('.sent-message');
      successMessage.classList.add('d-block');
      thisForm.reset();
      
      setTimeout(() => {
        successMessage.classList.add('fade');
        setTimeout(() => {
          successMessage.classList.remove('d-block', 'fade');
        }, 500); // Match this with your CSS transition time
      }, 4500); // Start fade 0.5s before removal

      // // Optional: Display reference ID if needed
      // if (data.reference_id) {
      //   console.log('Reference ID:', data.reference_id);
      // }
    } else {
      throw new Error(data.message || 'Form submission failed'); 
    }
  })
  .catch((error) => {
    displayError(thisForm, error);
  });
}

  function displayError(thisForm, error) {
    thisForm.querySelector('.loading').classList.remove('d-block');
    thisForm.querySelector('.error-message').innerHTML = error;
    thisForm.querySelector('.error-message').classList.add('d-block');
  }

})();
