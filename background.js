chrome.runtime.onInstalled.addListener(details => {
    chrome.contextMenus.create({
        id: "createTask",
        title: "Create Tasks",
        contexts: ["selection"]
    });
});

const keepAlive = (i => state => {
    if (state && !i) {
      if (performance.now() > 20e3) chrome.runtime.getPlatformInfo();
      i = setInterval(chrome.runtime.getPlatformInfo, 20e3);
    } else if (!state && i) {
      clearInterval(i);
      i = 0;
    }
  })();

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "createTask") {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
          const selectionText = window.getSelection().toString();
          if(selectionText.trim().length==0){
            chrome.runtime.sendMessage({ action: 'noTextWarn'});
          }
          else{
                if(selectionText.match(/\S+|\s/g).length<50){
                    chrome.runtime.sendMessage({ action: 'shortWarn'});
                }
                else if(selectionText.match(/\S+|\s/g).length<900){
                    chrome.runtime.sendMessage({ action: 'taskit', text: selectionText });
                }
                else{
                    chrome.runtime.sendMessage({ action: 'lengthWarn'});
                }
            }
        //   chrome.runtime.sendMessage({ action: 'notify', text: selectionText });
        //   chrome.runtime.sendMessage({ action: 'store', text: selectionText });
        //   chrome.runtime.sendMessage({ action: 'openTab', url: `https://www.google.com/search?q=${encodeURIComponent(selectionText)}` });
        }
      });
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'openTab') {
      chrome.tabs.create({ url: request.url });
    }
    if (request.action === 'lengthWarn'){
        chrome.notifications.create(
            "longTextAlert",
            {
                type: 'basic',
                title: 'Taskit.ai - Long Text Alert',
                message: 'Please select shorter text !',
                iconUrl: 'icon.png', priority: 2
            },
            function () {}
          );
    }
    if (request.action === 'shortWarn'){
        chrome.notifications.create(
            "shortTextAlert",
            {
                type: 'basic',
                title: 'Taskit.ai - Short Text Alert',
                message: 'Please select longer text !',
                iconUrl: 'icon.png', priority: 2
            },
            function () {}
          );
    }
    if (request.action === 'noTextWarn'){
        chrome.notifications.create(
            "noTextAlert",
            {
                type: 'basic',
                title: 'Taskit.ai - No Text Selected',
                message: 'Please select a text and try again',
                iconUrl: 'icon.png', priority: 2
            },
            function () {}
          );
    }
    if(request.action === 'taskit'){
        chrome.storage.local.get('tasklist', async (result) => {
            try{
                keepAlive(true);
                let tasklist = result.tasklist || [];
                chrome.notifications.create(
                    "creatingTasks",
                    {
                        type: 'basic',
                        title: 'Taskit.ai - Creating Tasks',
                        message: 'It\'ll just take a moment',
                        iconUrl: 'icon.png', priority: 2
                    },
                    function () {}
                );
                const session = await chrome.aiOriginTrial.languageModel.create({
                    systemPrompt: 'You are task creating assistant, designed to read documents and create tasks for people.',
                    temperature: 0.001,
                    topK: 3,
                });
                
                const result1 = await session.prompt(
                    'DOCUMENT : '+request.text+`
    Based of the Document above, create task lists in the following format, no additional styling required and do not deviate your response from the format: 
    <Task list name>
    <Task ID> - <Task Description>
    <Task ID> - <Task Description>
    <Task ID> - <Task Description> 

    If you don't find any task to create, your output should be "NOT APPLICABLE". If the Document has less than 30 english words then your output should be"NOT ENGLISH".

    SAMPLE OUTPUT: 
    Outdoor Tasks
    1 - Go to Supermarket
    2 - Buy Groceries
    3 - Wash Car
    4 - Repair Car`);
                    console.log(result1);
                if(result1.includes("NOT APPLICABLE")){
                    chrome.notifications.create(
                        "noTask",
                        {
                            type: 'basic',
                            title: 'Taskit.ai - Couldn\'t Create Task',
                            message: 'Please select different text and try again',
                            iconUrl: 'icon.png', priority: 2
                        },
                        function () {}
                    );
                }
                else if(result1.includes("NOT ENGLISH")){
                    chrome.notifications.create(
                        "noEnglish",
                        {
                            type: 'basic',
                            title: 'Taskit.ai - Language Not English',
                            message: 'Please select text with english language',
                            iconUrl: 'icon.png', priority: 2
                        },
                        function () {}
                    );
                }
                else{
                    const lines = result1.split('\n');

                    var listName = lines[0];
                    listName = listName.replace(/[^a-z0-9\- ]/gi, '').replace("Tasks","").replace("Lists","").replace("Task","").replace("List","").trim();

                    var date = new Date();
                    date.setDate(date.getDate() + 1);

                    var templist = [];
                    const tasks = lines.slice(1).map(line => templist.push({
                        task: line.trim(),
                        complete: false
                    }));
                    tasklist.push({[listName]:templist});

                    chrome.storage.local.set({tasklist: tasklist});

                    chrome.notifications.create(
                        "noTask",
                        {
                            type: 'basic',
                            title: 'Taskit.ai - Tasks Ready',
                            message: 'Click on Taskit to view',
                            iconUrl: 'icon.png', priority: 2
                        },
                        function () {}
                    );
                }
            } catch (err) {
                chrome.notifications.create(
                    "noEnglish",
                    {
                        type: 'basic',
                        title: 'Taskit.ai - Error Occured',
                        message: 'Please selectthe text and try again',
                        iconUrl: 'icon.png', priority: 2
                    },
                    function () {}
                );
            } finally {
                keepAlive(false);
            }
          });
    }
  });