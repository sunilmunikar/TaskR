﻿using System.Windows;
using System.Windows.Input;
using GalaSoft.MvvmLight.Messaging;
using TaskR.Models;
using TaskR.WindowsClient.Events;
using TaskR.WindowsClient.Views;

namespace TaskR.WindowsClient {
  public partial class MainWindow : Window {
    public MainWindow() {
      InitializeComponent();
      registerEventHandlers();
      registerHotkeys();
    }

    private void registerEventHandlers() {
      Messenger.Default.Register<NewTaskEvent>(this, (e) => {
        var newTaskView = new EditTaskView("New Task", new Task());
        newTaskView.Closed += (sender, ev) => {
          EditTaskView editedTaskView = (EditTaskView)sender;
          bool? result = editedTaskView.DialogResult;
          if (result.HasValue && result.Value == true) {
            Task newTask = newTaskView.DataContext as Task;
            if (newTask != null) {
              Messenger.Default.Send(new AddTaskEvent(newTask));
            }
          }
        };
        newTaskView.ShowDialog();
      });

      Messenger.Default.Register<TaskSelectedForEditEvent>(this, (e) => {
        if (e == null || e.Task == null) {
          return;
        }

        var editTaskView = new EditTaskView("Edit Task", e.Task);
        editTaskView.Closed += (sender, ev) => {
          EditTaskView editedTaskView = (EditTaskView)sender;
          bool? result = editedTaskView.DialogResult;
          if (result.HasValue && result.Value == true) {
            Task editedTask = editTaskView.DataContext as Task;
            if (editedTask != null) {
              if (editedTask.IsDeleted) {
                Messenger.Default.Send(new DeleteTaskEvent(editedTask));
              } else {
                Messenger.Default.Send(new UpdateTaskEvent(editedTask));
              }
            }
          }
        };
        editTaskView.ShowDialog();
      });

      Messenger.Default.Register<ExceptionEncounteredEvent>(this, (e) => {
        MessageBox.Show(e.Exception.Message + " | " + e.Exception.StackTrace + " | " + e.Exception.InnerException, "Unhandled Exception", MessageBoxButton.OK);
      });
    }

    private void registerHotkeys() {
      KeyUp += (s, e) => {
        switch (e.Key) {
          case System.Windows.Input.Key.L:
            if ((Keyboard.Modifiers & ModifierKeys.Shift) == ModifierKeys.Shift) {
              gridSplitter.Visibility = gridSplitter.Visibility == Visibility.Collapsed ? Visibility.Visible : Visibility.Collapsed;
              messages.Visibility = messages.Visibility == Visibility.Collapsed ? Visibility.Visible : Visibility.Collapsed;
            }
            break;
          default:
            break;
        }
      };
    }
  }
}
