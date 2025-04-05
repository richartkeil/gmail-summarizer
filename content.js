// Gmail interface changes frequently, so we need to wait for the toolbar to appear
// and then add our button

// Cache for storing summaries
const summaryCache = {};

// Function to generate a unique key for an email
function generateCacheKey(subject, body) {
  // Use subject and first 100 chars of body as a unique identifier
  return `${subject}_${body.slice(0, 100)}`;
}

// Function to extract the email content
function getEmailContent() {
  // Get email subject
  const subjectElement = document.querySelector('h2[data-thread-id]');
  const subject = subjectElement ? subjectElement.textContent.trim() : 'No subject';
  
  // Get email body
  const emailBody = document.querySelector('.a3s.aiL');
  const body = emailBody ? emailBody.innerHTML : '';
  
  return { subject, body };
}

// Function to show the summary in a popup
function showSummary(summary, cost) {
  // Create the modal overlay
  const overlay = document.createElement('div');
  overlay.className = 'gmail-summarizer-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  overlay.style.zIndex = '9999';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  
  // Add click event to close when clicking on the background
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) {
      document.body.removeChild(overlay);
    }
  });
  
  // Create the modal content
  const modal = document.createElement('div');
  modal.className = 'gmail-summarizer-modal';
  modal.style.backgroundColor = 'white';
  modal.style.borderRadius = '8px';
  modal.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
  modal.style.padding = '20px';
  modal.style.maxWidth = '600px';
  modal.style.width = '80%';
  modal.style.maxHeight = '80vh';
  modal.style.overflow = 'auto';
  
  // Create the modal header
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.style.marginBottom = '15px';
  
  const title = document.createElement('h3');
  title.textContent = 'Summary';
  title.style.margin = '0';
  title.style.fontSize = '18px';
  title.style.fontWeight = 'bold';
  
  header.appendChild(title);
  
  // Create content area
  const content = document.createElement('div');
  content.className = 'gmail-summarizer-content';
  
  // Set the summary content
  if (summary.startsWith('Error:')) {
    content.innerHTML = `<p style="color: red;">${summary}</p>`;
  } else {
    content.innerHTML = summary;
  }
  
  // Add cost footer if available
  if (cost) {
    const costFooter = document.createElement('div');
    costFooter.className = 'gmail-summarizer-cost';
    costFooter.textContent = cost;
    costFooter.style.marginTop = '15px';
    costFooter.style.fontSize = '11px';
    costFooter.style.color = '#888';
    costFooter.style.textAlign = 'right';
    content.appendChild(costFooter);
  }
  
  // Add loading spinner (initially hidden)
  const spinner = document.createElement('div');
  spinner.className = 'gmail-summarizer-spinner';
  spinner.style.display = 'none';
  spinner.style.textAlign = 'center';
  spinner.style.padding = '20px';
  spinner.innerHTML = 'Generating summary...';
  
  // Assemble the modal
  modal.appendChild(header);
  modal.appendChild(spinner);
  modal.appendChild(content);
  overlay.appendChild(modal);
  
  // Add to DOM
  document.body.appendChild(overlay);
  
  return { overlay, content, spinner };
}

// Function to create our summarize button
function createSummarizeButton() {
  // Create button container div with the same classes as other buttons
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'T-I J-J5-Ji aoD T-I-ax7 L3';
  buttonContainer.setAttribute('role', 'button');
  buttonContainer.setAttribute('tabindex', '0');
  buttonContainer.setAttribute('title', 'Summarize Email');
  
  // Add hover events to match Gmail's native hover behavior
  buttonContainer.addEventListener('mouseover', function() {
    this.classList.add('T-I-JW');
  });
  
  buttonContainer.addEventListener('mouseout', function() {
    this.classList.remove('T-I-JW');
  });
  
  // Add the inner structure similar to other Gmail buttons
  buttonContainer.innerHTML = `
    <div class="asa">
      <div class="T-I-J3 J-J5-Ji">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#333" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
        </svg>
      </div>
    </div>
  `;
  
  // Add click event listener
  buttonContainer.addEventListener('click', async function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Get email content
    const { subject, body } = getEmailContent();
    const cacheKey = generateCacheKey(subject, body);
    
    // Show modal with loading state
    const { overlay, content, spinner } = showSummary('');
    content.style.display = 'none';
    spinner.style.display = 'block';
    
    try {
      let summary, cost;
      
      // Check if we have a cached result
      if (summaryCache[cacheKey]) {
        console.log('Using cached summary');
        ({summary, cost} = summaryCache[cacheKey]);
      } else {
        // Call the summarization function if not cached
        const result = await window.summarizeEmail(subject, body);
        summary = result.summary;
        cost = result.cost;
        
        // Cache the result
        summaryCache[cacheKey] = {summary, cost};
      }
      
      // Update the modal with the summary
      spinner.style.display = 'none';
      content.style.display = 'block';
      
      if (summary.startsWith('Error:')) {
        content.innerHTML = `<p style="color: red;">${summary}</p>`;
      } else {
        content.innerHTML = summary;
        
        // Add cost footer
        if (cost) {
          const costFooter = document.createElement('div');
          costFooter.className = 'gmail-summarizer-cost';
          costFooter.textContent = cost;
          costFooter.style.marginTop = '15px';
          costFooter.style.fontSize = '11px';
          costFooter.style.color = '#888';
          costFooter.style.textAlign = 'right';
          content.appendChild(costFooter);
        }
      }
    } catch (error) {
      // Handle errors
      spinner.style.display = 'none';
      content.style.display = 'block';
      content.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    }
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