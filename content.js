// Gmail interface changes frequently, so we need to wait for the toolbar to appear
// and then add our button

// Function to create our summarize button
function createSummarizeButton() {
  // Create button container div with the same classes as other buttons
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'T-I J-J5-Ji aoD T-I-ax7 L3';
  buttonContainer.setAttribute('role', 'button');
  buttonContainer.setAttribute('tabindex', '0');
  buttonContainer.setAttribute('title', 'Summarize Email');
  
  // Add the inner structure similar to other Gmail buttons
  buttonContainer.innerHTML = `
    <div class="asa">
      <div class="T-I-J3 J-J5-Ji">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#454746" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
        </svg>
      </div>
    </div>
  `;
  
  // Add click event listener
  buttonContainer.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    alert('Email summarizer clicked!');
  });
  
  return buttonContainer;
}

// Function to inject our button into the toolbar
function injectButton() {
  // Look for the toolbar in the email view
  const toolbars = document.querySelectorAll('.G-atb');
  
  if (toolbars.length) {
    for (const toolbar of toolbars) {
      // Find the button group to insert our button
      const buttonGroup = toolbar.querySelector('.G-Ni.G-aE.J-J5-Ji:nth-child(3)');
      
      if (buttonGroup && !toolbar.querySelector('.gmail-summarizer-button')) {
        const button = createSummarizeButton();
        button.classList.add('gmail-summarizer-button'); // Add identifier class
        
        // Insert our button at the end of this button group
        buttonGroup.appendChild(button);
        console.log('Gmail Summarizer: Button added to toolbar');
      }
    }
  }
}

// Observer to watch for changes in the DOM
function setupObserver() {
  const observer = new MutationObserver(function(mutations) {
    // Check if we're in email view by looking for the toolbar
    if (document.querySelector('.G-atb')) {
      injectButton();
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Initial attempt to inject the button
injectButton();

// Set up observer to handle Gmail's dynamic interface
setupObserver(); 