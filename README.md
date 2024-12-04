## Taskit.ai: A Chrome Extension Powered by Generative AI

**Inspiration:**

Ever felt overwhelmed by a webpage full of information you need to turn into actionable steps? Taskit.ai was born from the desire to streamline this process. By leveraging generative AI, it simplifies the tedious task of manually creating to-do lists from web content.

**What it Does:**

- **AI-powered Task Creation:** Select any text on a webpage and instantly see it transformed into a set of manageable tasks. 
- **Comprehensive To-Do List Features:** 
    - Create, edit, complete, reorder, and delete tasks within the extension.
    - Organize tasks into multiple lists for different projects or contexts.
- **Flexible Task Management:**
    - Export your task list in common formats like text (txt) or comma-separated values (csv) for further use.
    - Copy tasks directly to the clipboard for easy pasting elsewhere.
    - Compose and send emails directly with your task list included.

**How I Built It:**

- **Generative AI Integration:** Utilized a generative AI model built into chrome (Gemini Nano) to analyze selected text and generate relevant tasks.
- **Chrome Extension Development:** Built the extension framework using Chrome's web development tools (HTML, CSS, JS) for seamless integration within the browser.
- **User Interface Design:** Focused on creating a user-friendly interface using Bootstrap that allows intuitive task management.

**Challenges I Ran Into:**

- **Balancing AI Accuracy:** Striking the right balance between AI-generated tasks accurately reflecting the webpage content and the need for user customization.
- **Chrome Extension Limitations:** Working within the constraints of Chrome extensions to ensure smooth functionality and data management.
- **UI/UX Optimization:** Creating a clear and efficient user experience that balances feature-richness with intuitive navigation. 

**Accomplishments I'm Proud Of:**

- Successfully integrating generative AI to automate task creation from web content.
- Building a fully functional to-do list app within the Chrome extension framework.
- Offering users multiple ways to export and utilize their task lists for further action.
- Keeping the background process alive when Gemini is generative the tasks

**What I Learned:**

- The power of generative AI in streamlining information extraction and task creation.
- The intricacies of Chrome extension development and its limitations.
- The importance of user-centered design principles in building a practical and enjoyable application.

**What's Next for Taskit.ai:**

- **Enhanced AI Accuracy:** Continuously refine the AI model/prompt to generate even more relevant and accurate tasks. 
- **Advanced Task Management:** Explore features like due dates, priorities, and integration with Google Task. 
- **Collaboration Features:** Consider functionalities that allow users to share and collaborate on task lists.
- **Cross-Platform Support:** Explore ways to make Taskit.ai accessible beyond Chrome, potentially adapting it for other browsers or even mobile devices.

## How to run it:
**Tested on Google Chrome Canary Version 133.0.6875.0**
- Open Chrome and go to chrome://extensions/.
- Enable "Developer mode" in the top right corner.
- Click "Load unpacked".
- Select the directory where you cloned this repo
- In the address bar, type chrome://flags/ and press Enter.
- This will open the experimental features page.
- Search for "Summarization API for Gemini Nano."
- Enable the flag by selecting "Enabled" from the dropdown menu.
- Restart chrome
- Go to any webpage, highlight few text, then right click > Create tasks
