var ai_working = true;
var globalTasks;
function installAI(){
    chrome.aiOriginTrial.languageModel.capabilities().then(async (capabilities) => {
        if (capabilities.available) {
            if(capabilities.available=='after-download'){
                document.getElementById('progressbar').style.display = 'inline';
                const session = await chrome.aiOriginTrial.languageModel.create({
                    monitor(m) {
                        document.getElementById("loadbar").style.display = 'inline';
                      m.addEventListener("downloadprogress", (e) => {
                        document.getElementById("loadbar").style.width = Math.round(e.loaded/e.total) + '%';
                        if(Math.round(e.loaded/e.total)>98){
                            document.getElementById('progressbar').style.display = 'none';
                            document.getElementById('loadbar').style.display = 'none';
                        }
                      });
                    },
                });
            }
        } else {
            ai_working = false;
        }
    });
}

chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
        installAI();
    }
});

window.addEventListener('load', installAI);

function updateTask(tasks, oldTaskName, newTaskName) {
    for (let taskList of tasks) {
      for (let listName in taskList) {
        const tasksInList = taskList[listName];
        for (let i = 0; i < tasksInList.length; i++) {
          if (tasksInList[i].task === oldTaskName) {
            tasksInList[i].task = newTaskName;
            chrome.storage.local.set({tasklist: tasks});
            return;
          }
        }
      }
    }
}

function updateTaskListName(tasks, oldListName, newListName) {
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i][oldListName]) {
        tasks[i][newListName] = tasks[i][oldListName];
        delete tasks[i][oldListName];
        chrome.storage.local.set({tasklist: tasks});
        return;
      }
    }
  }

  function addTaskToList(tasks, listName, newTask) {
    for (let taskList of tasks) {
      if (taskList[listName]) {
        taskList[listName].push({ task: newTask, complete: false });
        chrome.storage.local.set({tasklist: tasks});
        return;
      }
    }
  }

  function moveTaskUp(tasks, listName, taskName) {
    for (let taskList of tasks) {
      if (taskList[listName]) {
        const tasksInList = taskList[listName];
        for (let i = 1; i < tasksInList.length; i++) { // Start from index 1 to avoid out-of-bounds
          if (tasksInList[i].task === taskName) {
            [tasksInList[i - 1], tasksInList[i]] = [tasksInList[i], tasksInList[i - 1]];
            chrome.storage.local.set({tasklist: tasks});
            return;
          }
        }
      }
    }
  }

  function moveTaskDown(tasks, listName, taskName) {
    for (let taskList of tasks) {
      if (taskList[listName]) {
        const tasksInList = taskList[listName];
        for (let i = 0; i < tasksInList.length - 1; i++) { // Iterate until the second-to-last element
          if (tasksInList[i].task === taskName) {
            [tasksInList[i], tasksInList[i + 1]] = [tasksInList[i + 1], tasksInList[i]];
            chrome.storage.local.set({tasklist: tasks});
            return;
          }
        }
      }
    }
  }

  function deleteTask(tasks, listName, taskName) {
    for (let taskList of tasks) {
      if (taskList[listName]) {
        const tasksInList = taskList[listName];
        for (let i = 0; i < tasksInList.length; i++) {
          if (tasksInList[i].task === taskName) {
            tasksInList.splice(i, 1);
            chrome.storage.local.set({tasklist: tasks});
            return;
          }
        }
      }
    }
  }

  function deleteTaskList(tasks, listName) {
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i][listName]) {
        tasks.splice(i, 1);
        chrome.storage.local.set({tasklist: tasks});
        return;
      }
    }
  }

  function markTaskComplete(tasks, listName, taskName, boolval=null) {
    for (let taskList of tasks) {
      if (taskList[listName]) {
        const tasksInList = taskList[listName];
        for (let i = 0; i < tasksInList.length; i++) {
          if (tasksInList[i].task === taskName) {
            if(boolval===null){
                tasksInList[i].complete = !tasksInList[i].complete;
            }
            else{
                tasksInList[i].complete = boolval;
            }
            chrome.storage.local.set({tasklist: tasks});
            return;
          }
        }
      }
    }
  }

  function markTaskListComplete(tasks, listName, boolval=null) {
    for (let taskList of tasks) {
      if (taskList[listName]) {
        taskList[listName].forEach(task => {
            if(boolval===null){
                task.complete = !task.complete;
            }
            else{
                task.complete = boolval;
            }
        });
        chrome.storage.local.set({tasklist: tasks});
        return;
      }
    }
  }

  function isTaskListComplete(tasks, listName) {
    for (let taskList of tasks) {
      if (taskList[listName]) {
        const tasksInList = taskList[listName];
        return tasksInList.every(task => task.complete);
      }
    }
    return false;
  }

  function removeBlankTasks(tasks) {
    for (let taskList of tasks) {
      for (let listName in taskList) {
        taskList[listName] = taskList[listName].filter(task => task.task.trim() !== '');
      }
    }
  }

  function sendEmail(emailAddress, tasks, listName) {
    const taskList = tasks.find(list => list[listName]);
  
    const formattedTasks = taskList[listName].map(task => {
      return `${task.task} (${task.complete ? 'Completed' : 'Incomplete'})`;
    }).join('\n');
  
    const mailtoLink = `mailto:${emailAddress}?subject=${encodeURIComponent(listName)}&body=${encodeURIComponent(formattedTasks)}`;
  
    window.location.href = mailtoLink;
  }

  function copyToClipboard(tasks, listName){
    const taskList = tasks.find(list => list[listName]);
  
    const formattedTasks = listName +"\n"+ taskList[listName].map(task => {
      return `${task.task} (${task.complete ? 'Completed' : 'Incomplete'})`;
    }).join('\n');

    navigator.clipboard.writeText(formattedTasks);
    alert("Copied " + listName);
  }

  function downloadTaskList(tasks, listName) {
    const taskList = tasks.find(list => list[listName]);

    const formattedTasks = taskList[listName].map(task => {
      return `- ${task.task} (${task.complete ? 'Completed' : 'Incomplete'})`;
    }).join('\n');
  
    const blob = new Blob([formattedTasks], { type: 'text/plain' });
  
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${listName}.txt`;
    link.click();
  
    URL.revokeObjectURL(link.href);
  }

  function downloadTaskListCSV(tasks, listName) {
    const taskList = tasks.find(list => list[listName]);

    const formattedTasks = "Tasks,Status\n" + taskList[listName].map(task => {
      return `${task.task.replaceAll(',','')},${task.complete ? 'Completed' : 'Incomplete'}`;
    }).join('\n');
  
    const blob = new Blob([formattedTasks], { type: 'text/plain' });
  
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${listName}.csv`;
    link.click();
  
    URL.revokeObjectURL(link.href);
  }

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get('tasklist', (result) => {
        const taskListUI = document.getElementById('taskList');
        globalTasks = JSON.parse(JSON.stringify(result.tasklist));
        removeBlankTasks(globalTasks);
        if (!Array.isArray(result.tasklist) || !result.tasklist.length){
            taskListUI.insertAdjacentHTML( 'beforeend',  '<header class="bg-light p-3 d-flex justify-content-between align-items-center"><span>No tasks found. Add some AI Generated tasks by highlight some text then Right click > Create Task.</span></header>');
            return;
        }
        let tasknames = Object.keys(result.tasklist);
        var str_div = `<div id="carouselExampleControls" class="carousel" data-bs-interval="false">
            <header class="bg-light p-3 d-flex justify-content-between align-items-center">
                    <button class="btn btn-primary" data-bs-target="#carouselExampleControls" data-bs-slide="prev">PREV</button>
                    <div>
                        <img src="icon.png" style="width:50px;height:50px;"></img>
                        <span><strong>Taskit.ai</strong></span>
                    </div>
                    <button class="btn btn-primary" data-bs-target="#carouselExampleControls" data-bs-slide="next">NEXT</button>
                </header>
                <div class="carousel-inner">`;
        tasknames.forEach((item, index)=>{
            var str_li = '';
            var itemname = Object.keys(result.tasklist[item])[0];
            var total_task = 0;
            var completed_task = 0;
            result.tasklist[item][itemname].forEach((item1, index) => {
                if(item1.task!=''){
                    total_task++;
                    if(item1.complete){
                        completed_task++;
                    }
                }
            });
            str_div += `<div class="carousel-item `+(index==(tasknames.length-1) ? 'active':'')+`">
            <div class="bg-light p-3 d-flex justify-content-between align-items-center">
                       <button class="btn btn-sm `+(completed_task==total_task ? "":"btn-success")+` taskdone">
                                <i class="fa fa-check"></i>
                        </button>
                        <span class="flex-grow-1 tasktext" style="padding-left:2%;width:100px;"><strong `+(completed_task==total_task ? "class=\"strikethrough\"":"")+`>`+itemname+`</strong></span>
                        <div>
                            <button class="btn btn-sm btn-primary taskadd">
                                    <i class="fa fa-add"></i>
                            </button>
                            <button class="btn btn-sm btn-warning taskedit">
                                    <i class="fa fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger taskdel">
                                    <i class="fa fa-trash"></i>
                        </button>
                        </div></div>
            <main class="container mt-3">
                <ul class="list-group overflow-auto" style="height: 300px;">`;
            result.tasklist[item][itemname].forEach((item1, index) => {
                if(item1.task!=''){
                    str_li += `<li class="list-group-item d-flex justify-content-between align-items-center">
                        <div style="padding-right:5px;">
                            <button class="btn btn-xs btn-info moveUpButton">
                                <i class="fa fa-chevron-up"></i>
                            </button><br>
                            <button class="btn btn-xs btn-info moveDownButton">
                                <i class="fa fa-chevron-down"></i>
                            </button>
                        </div>
                        <button class="btn btn-sm `+(item1.complete ? "":"btn-success")+` taskdone">
                                <i class="fa fa-check"></i>
                        </button>
                        <span class="flex-grow-1 tasktext`+(item1.complete ? " strikethrough":"")+`" style="padding-left:2%;width:100px;">`+item1.task+`</span>
                        <div>
                            <button class="btn btn-sm btn-warning taskedit">
                                    <i class="fa fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger taskdel">
                                    <i class="fa fa-trash"></i>
                        </button>
                        </div>
                    </li>`;
                }
            });
            str_div += str_li + `</ul></main>
            <footer class="bg-light p-3 d-flex justify-content-between align-items-center">
        <button class="btn btn-primary copyTask"><i class='fas fa-clipboard-list'></i> COPY</button>
        <button class="btn btn-primary downloadText"><i class='fas fa-file-download'></i> TEXT</button>
        <button class="btn btn-primary downloadExcel"><i class='fas fa-file-download'></i> EXCEL</button>
        <button class="btn btn-primary emailTask" ><i class="fas fa-envelope"></i> EMAIL</button>
    </footer></div>`;
        });
        str_div += `</div></div>`;

        taskListUI.insertAdjacentHTML( 'beforeend',  str_div);

        const carouselItems = document.querySelectorAll('.carousel-item');

        carouselItems.forEach(item => {
        const strikeButtonTop = item.querySelector('.taskdone');
        const editButton = item.querySelector('.taskedit');
        const deleteButton = item.querySelector('.taskdel');
        const addButton = item.querySelector('.taskadd');
        const textElement = item.querySelector('strong');
        const emailButton = item.querySelector(".emailTask");
        const downloadExcel = item.querySelector('.downloadExcel');
        const downloadText = item.querySelector('.downloadText');
        const copyTask = item.querySelector('.copyTask');

        emailButton.addEventListener("click", () => {
            const newText = prompt('Enter the email address:');
            if (newText) {
                sendEmail(newText,globalTasks,textElement.textContent);
            }
        });

        downloadExcel.addEventListener('click', () => {
            downloadTaskListCSV(globalTasks,textElement.textContent);
        });

        downloadText.addEventListener('click', () => {
            downloadTaskList(globalTasks,textElement.textContent);
        });

        copyTask.addEventListener('click', () => {
            copyToClipboard(globalTasks,textElement.textContent);
        });

        strikeButtonTop.addEventListener('click', () => {
                if(!textElement.classList.contains('strikethrough')){
                    textElement.classList.add('strikethrough');
                    strikeButtonTop.classList.remove('btn-success');
                }
                else{
                    textElement.classList.remove('strikethrough');
                    strikeButtonTop.classList.add('btn-success');
                }
                markTaskListComplete(globalTasks,textElement.textContent,textElement.classList.contains('strikethrough'));
                const listItems = item.querySelectorAll('li');
                listItems.forEach(elements => {
                        var eleSpan = elements.querySelector('.tasktext');
                        var eleStrikeButton = elements.querySelector('.taskdone');
                        if (!textElement.classList.contains('strikethrough')) {
                                eleSpan.classList.remove('strikethrough');
                                eleStrikeButton.classList.add('btn-success');
                        }
                        else{
                                eleSpan.classList.add('strikethrough');
                                eleStrikeButton.classList.remove('btn-success');
                        }
                });
        });

        addButton.addEventListener('click', () => {
            const newText = prompt('Add a new task:');
            if (newText) {
                const listItems = item.querySelector('ul');
                var newitem = `<li class="list-group-item d-flex justify-content-between align-items-center">
                        <div style="padding-right:5px;">
                            <button class="btn btn-xs btn-info moveUpButton">
                                <i class="fa fa-chevron-up"></i>
                            </button><br>
                            <button class="btn btn-xs btn-info moveDownButton">
                                <i class="fa fa-chevron-down"></i>
                            </button>
                        </div>
                        <button class="btn btn-sm btn-success taskdone">
                                <i class="fa fa-check"></i>
                        </button>
                        <span class="flex-grow-1 tasktext" style="padding-left:2%;width:100px;">`+newText+`</span>
                        <div>
                            <button class="btn btn-sm btn-warning taskedit">
                                    <i class="fa fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger taskdel">
                                    <i class="fa fa-trash"></i>
                        </button>
                        </div>
                    </li>`;
                    listItems.insertAdjacentHTML( 'beforeend',  newitem);

                    if(textElement.classList.contains('strikethrough')){
                        textElement.classList.remove('strikethrough');
                        strikeButtonTop.classList.add('btn-success');
                    }

                    addTaskToList(globalTasks,textElement.textContent,newText);

                    const latestItem = listItems.lastChild;

                    const strikeButton = latestItem.querySelector('.taskdone');
                    const editButton = latestItem.querySelector('.taskedit');
                    const deleteButton = latestItem.querySelector('.taskdel');
                    const textSpan = latestItem.querySelector('.tasktext');
                    const moveUpButton = latestItem.querySelector(".moveUpButton");
                    const moveDownButton = latestItem.querySelector(".moveDownButton");

                    editButton.addEventListener('click', () => {
                        const newText = prompt('Enter new text:',textSpan.textContent);
                        if (newText) {
                            updateTask(globalTasks,JSON.parse(JSON.stringify(textSpan.textContent)), newText);
                            textSpan.textContent = newText;
                        }
                    });

                    moveUpButton.addEventListener("click", () => {
                        const parentList = latestItem.parentNode;
                        const previousItem = latestItem.previousElementSibling;
                    
                        if (previousItem) {
                        parentList.insertBefore(latestItem, previousItem);
                        moveTaskUp(globalTasks,textElement.textContent,textSpan.textContent);
                        }
                    });

                    moveDownButton.addEventListener("click", () => {
                        const parentList = latestItem.parentNode;
                        const nextItem = latestItem.nextElementSibling;
                    
                        if (nextItem) {
                        parentList.insertBefore(nextItem, latestItem);
                        moveTaskDown(globalTasks,textElement.textContent,textSpan.textContent);
                        }
                    });

                    strikeButton.addEventListener('click', () => {
                        textSpan.classList.toggle('strikethrough');
                        strikeButton.classList.toggle('btn-success');
                        markTaskComplete(globalTasks,textElement.textContent,textSpan.textContent);
                        if(isTaskListComplete(globalTasks,textElement.textContent)){
                            if(!textElement.classList.contains('strikethrough')){
                                textElement.classList.add('strikethrough');
                                strikeButtonTop.classList.remove('btn-success');
                            }
                        }
                        else{
                            if(textElement.classList.contains('strikethrough')){
                                textElement.classList.remove('strikethrough');
                                strikeButtonTop.classList.add('btn-success');
                            }
                        }
                    });

                    editButton.addEventListener('click', () => {
                        const newText = prompt('Edit task:',textSpan.textContent);
                        if (newText) {
                            updateTask(globalTasks,JSON.parse(JSON.stringify(textSpan.textContent)), newText);
                            textSpan.textContent = newText;
                        }
                    });

                    deleteButton.addEventListener('click', () => {
                        if (confirm("Are you sure you want to delete this ?") == true) {
                            latestItem.style.cssText = 'display:none !important';
                            deleteTask(globalTasks,textElement.textContent,textSpan.textContent);
                        }
                    });
            }
        });

        editButton.addEventListener('click', () => {
                const newText = prompt('Edit Task List Name:',textElement.textContent);
                if (newText) {
                    updateTaskListName(globalTasks,JSON.parse(JSON.stringify(textElement.textContent)), newText);
                    textElement.textContent = newText;
                }
        });

        deleteButton.addEventListener('click', () => {
                if (confirm("Are you sure you want to delete this ?") == true) {
                    item.style.cssText = 'display:none !important';
                    const list = item.querySelector('ul');
                    if (list) {
                            list.style.cssText = 'display:none !important';
                    }
                    deleteTaskList(globalTasks,textElement.textContent);
                }
            });
        });

        const listItems = document.querySelectorAll('#taskList li');

        listItems.forEach(item => {
            const strikeButton = item.querySelector('.taskdone');
            const editButton = item.querySelector('.taskedit');
            const deleteButton = item.querySelector('.taskdel');
            const textSpan = item.querySelector('.tasktext');
            const moveUpButton = item.querySelector(".moveUpButton");
            const moveDownButton = item.querySelector(".moveDownButton");

            editButton.addEventListener('click', () => {
                const newText = prompt('Enter new text:',textSpan.textContent);
                if (newText) {
                    updateTask(globalTasks,JSON.parse(JSON.stringify(textSpan.textContent)), newText);
                    textSpan.textContent = newText;
                }
            });

            moveUpButton.addEventListener("click", () => {
                const parentList = item.parentNode;
                const previousItem = item.previousElementSibling;
              
                if (previousItem) {
                  var taskname = parentList.parentNode.previousElementSibling.querySelector('.tasktext').textContent;
                  moveTaskUp(globalTasks,taskname,textSpan.textContent);
                  parentList.insertBefore(item, previousItem);
                }
            });

            moveDownButton.addEventListener("click", () => {
                const parentList = item.parentNode;
                const nextItem = item.nextElementSibling;
              
                if (nextItem) {
                var taskname = parentList.parentNode.previousElementSibling.querySelector('.tasktext').textContent;
                  moveTaskDown(globalTasks,taskname,textSpan.textContent);
                  parentList.insertBefore(nextItem, item);
                }
            });

            strikeButton.addEventListener('click', () => {
                textSpan.classList.toggle('strikethrough');
                strikeButton.classList.toggle('btn-success');
                const parentList = item.parentNode;
                var taskname = parentList.parentNode.previousElementSibling.querySelector('.tasktext').textContent;
                markTaskComplete(globalTasks,taskname,textSpan.textContent);
                if(isTaskListComplete(globalTasks,taskname)){
                    if(!parentList.parentNode.previousElementSibling.querySelector('strong').classList.contains('strikethrough')){
                        parentList.parentNode.previousElementSibling.querySelector('strong').classList.add('strikethrough');
                        parentList.parentNode.previousElementSibling.querySelector('.taskdone').classList.remove('btn-success');
                    }
                }
                else{
                    if(parentList.parentNode.previousElementSibling.querySelector('strong').classList.contains('strikethrough')){
                        parentList.parentNode.previousElementSibling.querySelector('strong').classList.remove('strikethrough');
                        parentList.parentNode.previousElementSibling.querySelector('.taskdone').classList.add('btn-success');
                    }
                }
            });

            editButton.addEventListener('click', () => {
                const newText = prompt('Edit task:',textSpan.textContent);
                if (newText) {
                    updateTask(globalTasks,JSON.parse(JSON.stringify(textSpan.textContent)), newText);
                    textSpan.textContent = newText;
                }
            });

            deleteButton.addEventListener('click', () => {
                const parentList = item.parentNode;
                if (confirm("Are you sure you want to delete this ?") == true) {
                    var taskname = parentList.parentNode.previousElementSibling.querySelector('.tasktext').textContent;
                    deleteTask(globalTasks,taskname,textSpan.textContent);
                    item.style.cssText = 'display:none !important';
                }
            });
        });
    });
});