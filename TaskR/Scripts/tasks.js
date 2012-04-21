﻿(function ($, connection, window) {
  "use strict";

  function padZero(s) {
    s = s.toString();
    if (s.length == 1) {
      return "0" + s;
    }
    return s;
  }

  String.prototype.fromJsonDate = function () {
    return eval(this.replace(/\/Date\((\d+)(\+|\-)?.*\)\//gi, "new Date($1)"))
  };

  Date.prototype.formatDate = function () {
    var m = this.getMonth() + 1,
            d = this.getDate(),
            y = this.getFullYear();

    return m + "/" + d + "/" + y;
  };

  Date.prototype.formatTime = function (showAp) {
    var ap = "";
    var hr = this.getHours();

    if (hr < 12) {
      ap = "AM";
    }
    else {
      ap = "PM";
    }

    if (hr == 0) {
      hr = 12;
    }

    if (hr > 12) {
      hr = hr - 12;
    }

    var mins = padZero(this.getMinutes());
    var seconds = padZero(this.getSeconds());
    return hr + ":" + mins + ":" + seconds
            + (showAp ? " " + ap : "");
  };

  var taskHub = connection.taskHub;
  var username = "andyjmay";

  var tasksViewModel = {
    tasks: ko.observableArray(),
    EditTask: function () {
      taskViewModel.TaskID(this.TaskID);
      taskViewModel.Title(this.Title);
      taskViewModel.AssignedTo(this.AssignedTo);
      taskViewModel.Status(this.Status);
      taskViewModel.Details(this.Details);
      
      //TODO: Fix this UI call
      $('#editTaskModal').modal('show');
    }
  };

  var taskViewModel = {
    TaskID: new ko.observable(),
    Title: new ko.observable(),
    AssignedTo: new ko.observable(),
    Status: new ko.observable(),
    Details: new ko.observable(),
    DateCreated: new ko.observable(),
    AddTask: function () {
      tasks.addTask(ko.toJSON(this));
    },
    UpdateTask: function () {
      tasks.updateTask(ko.toJSON(this));
    },
    DeleteTask: function () {
      tasks.deleteTask(ko.toJSON(this));
      $('#editTaskModal').modal('hide');
    }
  };

  taskHub.GotTasksForUser = function (results) {
    if (results) {
      $.each(results, function () {
        var task = this;
        var taskDateCreated = task.DateCreated.fromJsonDate();
        task.DateCreated = taskDateCreated.formatDate() + " " + taskDateCreated.formatTime(true);
        tasksViewModel.tasks.push(task);
      });
    }
  };

  taskHub.GotLogMessage = function (logMessage) {
  };

  taskHub.AddedTask = function (task) {
    var taskDateCreated = task.DateCreated.fromJsonDate();
    task.DateCreated = taskDateCreated.formatDate() + " " + taskDateCreated.formatTime(true);
    tasksViewModel.tasks.push(task);
  };

  taskHub.UpdatedTask = function (task) {
    var taskDateCreated = task.DateCreated.fromJsonDate();
    task.DateCreated = taskDateCreated.formatDate() + " " + taskDateCreated.formatTime(true);
    taskHub.DeletedTask(task);
    tasksViewModel.tasks.push(task);
    tasksViewModel.tasks.sort(function (left, right) {
      return left === right ? 0 : (left.TaskID < right.TaskID ? -1 : 1)
    });
    //var tasksInViewModel = tasksViewModel.tasks();
    //for (var i = 0; i < tasksInViewModel.length; i++) {
    //  if (taskViewModel[i].TaskID == task.TaskID) {
    //    tasksViewModel.tasks().
    //  }
    //}
  };

  taskHub.DeletedTask = function (task) {
    tasksViewModel.tasks.remove(function (taskToRemove) {
      return taskToRemove.TaskID === task.TaskID;
    });
  };

  taskHub.HandleException = function (ex) {
    alert(ex);
  };

  // Connect to the hub
  $(function () {
    connection.hub.start(function () {
      taskHub.login(username)
               .fail(function (e) {
                 taskHub.HandleException(e);
               })
               .done(function (success) {
                 if (success === false) {
                   alert("failed");
                 } else {
                 }
               });
    });
  });

  var tasks = {
    addTask: function (newTask) {
      taskHub.addTask(newTask)
               .fail(function (e) {
                 taskHub.HandleException(e);
               })
               .done(function (success) {
                 if (success === false) {
                   alert("failed");
                 } else {                   
                 }
               });
    },
    updateTask: function (updatedTask) {
      taskHub.updateTask(updatedTask)
               .fail(function (e) {
                 taskHub.HandleException(e);
               })
               .done(function (success) {
                 if (success === false) {
                   alert("failed");
                 } else {
                 }
               });
    },
    deleteTask: function (taskToDelete) {
      taskHub.deleteTask(taskToDelete)
               .fail(function (e) {
                 taskHub.HandleException(e);
               })
               .done(function (success) {
                 if (success === false) {
                   alert("failed");
                 } else {
                 }
               });
    }
  };

  window.tasks = tasks;

  // Apply KO bindings
  ko.applyBindings(tasksViewModel, document.getElementById('tasks'));
  ko.applyBindings(taskViewModel, document.getElementById('newTaskModal'));
  ko.applyBindings(taskViewModel, document.getElementById('editTaskModal'));
})(jQuery, $.connection, window);