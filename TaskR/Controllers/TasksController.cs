﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace TaskR.Controllers {
  public class TasksController : Controller {
    public ActionResult Index() {
      return View();
    }
  }
}
