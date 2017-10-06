using KeymazeLocal.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web.Http;

namespace KeymazeLocal
{
    public class LocalController : BaseApiController
    {
        [HttpPost, AllowAnonymous]
        public void OpenDataBase()
        {
            Service.OpenDataBase();
        }
        [HttpPost, AllowAnonymous]
        public List<Performance> GetPerformances()
        {
            return Service.GetPerformances();
        }

        [HttpPost, AllowAnonymous]
        public InfoPerformance GetInfoPerformance()
        {
            return Service.GetInfoPerformance();
        }
        [HttpPost, AllowAnonymous]
        public bool InsertPerformance(Performance p_objPerformance)
        {
            return Service.InsertPerformance(p_objPerformance);
        } 
    }
}
