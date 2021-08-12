var formEl = document.querySelector("#task-form");
var tasksToDoEl = document.querySelector("#tasks-to-do");
var taskIdCounter = 0;
var pageContentEl = document.querySelector("#page-content");
var tasksInProgressEl = document.querySelector("#tasks-in-progress");
var tasksCompletedEl = document.querySelector("#tasks-completed");
var tasks = [];

var taskFormHandler = function (event) {
  event.preventDefault();
  var taskNameInput = document.querySelector("input[name='task-name']").value;
  var taskTypeInput = document.querySelector("select[name='task-type']").value;
  //check if input values are empty strings
  if (!taskNameInput || !taskTypeInput) {
    alert("You need to fill out the task form!");
    return false;

  }
  formEl.reset();

  var isEdit = formEl.hasAttribute("data-task-id");

  //package data as object
  var taskDataObj = {
    name: taskNameInput,
    type: taskTypeInput
  };
  //send it as an arguement to createTaskEl
  if (isEdit) {
    var taskId = formEl.getAttribute("data-task-id");
    completeEditTask(taskNameInput, taskTypeInput, taskId);
  } 
  // no data attribute, so create object as normal and pass to createTaskEl function
  else {
    var taskDataObj = {
      name: taskNameInput,
      type: taskTypeInput,
      status: "to do"
    };
    console.log(taskDataObj);
    console.log(taskDataObj.status);
    createTaskEl(taskDataObj);
  };
};

var createTaskEl = function(taskDataObj) {
  // create list item
var listItemEl = document.createElement("li");
listItemEl.className = "task-item";

//add task id as a custom attribute
listItemEl.setAttribute("data-task-id",taskIdCounter);

// create div to hold task info and add to list item
var taskInfoEl = document.createElement("div");
taskInfoEl.className = "task-info";
taskInfoEl.innerHTML = "<h3 class='task-name'>" + taskDataObj.name + "</h3><span class='task-type'>" + taskDataObj.type + "</span>";

listItemEl.appendChild(taskInfoEl);

taskDataObj.id = taskIdCounter;

tasks.push(taskDataObj);
//call update local storage
saveTasks();
var taskActionsEl = createTaskActions(taskIdCounter);
listItemEl.appendChild(taskActionsEl);

// add entire list item to list
tasksToDoEl.appendChild(listItemEl);

//increase task counter
taskIdCounter++;
};

var completeEditTask = function(taskName, taskType, taskId) {
  //find the matching task list item
  var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");

  //set new values
  taskSelected.querySelector("h3.task-name").textContent = taskName;
  taskSelected.querySelector("span.task-type").textContent = taskType;

  //loop through tasks array and task objecct with new content
  for (var i = 0; i < tasks.length; i++) {
    if(tasks[i].id === parseInt(taskId)) {
      tasks[i].name = taskName;
      tasks[i].type = taskType;
    }
  };

  //call to save to local storage
  saveTasks();

  formEl.removeAttribute("data-task-id");
  document.querySelector("#save-task").textContent = "Add Task";
};

var createTaskActions = function(taskId) {
    var actionContainerEl = document.createElement("div");
    actionContainerEl.className = "task-actions";

    //create edit button
    var editButtonEl = document.createElement("button");
    editButtonEl.textContent = "Edit";
    editButtonEl.className = "btn edit-btn";
    editButtonEl.setAttribute("data-task-id", taskId);

    actionContainerEl.appendChild(editButtonEl);

    //create delete button
    var deleteButtonEl = document.createElement("button");
    deleteButtonEl.textContent = "Delete";
    deleteButtonEl.className = "btn delete-btn";
    deleteButtonEl.setAttribute("data-task-id", taskId);

    actionContainerEl.appendChild(deleteButtonEl);

    var statusSelectEl = document.createElement("select");
    statusSelectEl.className = "select-status";
    statusSelectEl.setAttribute("name", "status-change");
    statusSelectEl.setAttribute("data-task-id", taskId);

    actionContainerEl.appendChild(statusSelectEl);

    var statusChoices = ["To Do", "In Progress", "Completed"];

    for(var i = 0; i < statusChoices.length; i++) {
        //create option element
        var statusOptionEl = document.createElement("option");
        statusOptionEl.textContent = statusChoices[i];
        statusOptionEl.setAttribute("value", statusChoices[i]);

        //append option to list
        statusSelectEl.appendChild(statusOptionEl);
    }

    return actionContainerEl;
};

var taskButtonHandler = function(){
    console.log(event.target);

    //delete button is clicked
    if(event.target.matches(".delete-btn")) {
        //get the elements task id
        var taskId = event.target.getAttribute("data-task-id");
        deleteTask(taskId);
    }

    //edit button is clicked
    else if (event.target.matches(".edit-btn")) {
      var taskId = event.target.getAttribute("data-task-id");
      editTask(taskId);
    }
};

var editTask = function(taskId) {
  //get task list item element
  var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");
  //get content from task name and type
  var taskName = taskSelected.querySelector("h3.task-name").textContent;
  var taskType = taskSelected.querySelector("span.task-type").textContent;

  //set fields to the task name and type
  document.querySelector("input[name='task-name']").value = taskName;
  document.querySelector("select[name='task-type']").value = taskType;
  document.querySelector("#save-task").textContent = "Save Task";
  formEl.setAttribute("data-task-id", taskId);
};

var deleteTask = function(taskId) {
    var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");
    taskSelected.remove();

    var updatedTaskArr = [];

    //loop through current tasks
    for (var i = 0; i < tasks.length; i++){
      //if tasks[i].id doesnt match the value of taskID, let's keep taht task
      if(tasks[i].id !== parseInt(taskId)) {
        updatedTaskArr.push(tasks[i]);
      }
    }

    //reassign tasks array to be the same as updatedTaskArr
    tasks = updatedTaskArr;
    saveTasks();
};

//function to handle status change
var taskStatusChangeHandler = function(event) {
  //get task id
  var taskId = event.target.getAttribute("data-task-id");

  //get the currently selected option's value and convert to lowercase
  var statusValue = event.target.value.toLowerCase();

  //find the parent task item element based on the id
  var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");

  if (statusValue === "to do") {
    tasksToDoEl.appendChild(taskSelected);
  }
  else if (statusValue === "in progress") {
    tasksInProgressEl.appendChild(taskSelected);
  }
  else if (statusValue === "completed") {
    tasksCompletedEl.appendChild(taskSelected);
  }

  //updates task's in tasks array
  for(var i = 0; i < tasks.length; i++) {
    tasks[i].status = statusValue;
  }

  //call to update local storage
  saveTasks();
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

var loadTasks =  function() {
  savedTasks = localStorage.getItem("tasks");
  if(!savedTasks) {
    return false;
  }
  savedTasks = JSON.parse(savedTasks);

  //loop through savedTasks array
  for(var i = 0; i < savedTasks.length; i++) {
    //pass each task object into the createTaskEl() function
    createTaskEl(savedTasks[i]);
  }
};

loadTasks();
formEl.addEventListener("submit", taskFormHandler);
pageContentEl.addEventListener("click", taskButtonHandler);
pageContentEl.addEventListener("change", taskStatusChangeHandler);