using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Web.Http;

namespace KeymazeLocal
{
    public abstract class BaseApiController : ApiController
    {
        protected override void Initialize(System.Web.Http.Controllers.HttpControllerContext controllerContext)
        {
            base.Initialize(controllerContext);
        }

        protected override void Dispose(bool disposing)
        {
            base.Dispose(disposing);
        }

        protected string GetContentType(string p_strFileName)
        {
            switch (Path.GetExtension(p_strFileName.ToLower()))
            {
                case ".wav": return "audio/wav";
                case ".pdf": return "application/pdf";
                case ".gif": return "image/gif";
                case ".jpg": return "image/jpeg";
                case ".png": return "image/png";
                default: return "application/octet-stream";
            }
        }

        protected HttpResponseMessage GetFileResponseForDownload(byte[] p_objFileContent, string p_strFileName)
        {
            var l_objResponse = new HttpResponseMessage(HttpStatusCode.OK);
            l_objResponse.Content = new StreamContent(new MemoryStream(p_objFileContent));
            l_objResponse.Content.Headers.ContentType = MediaTypeHeaderValue.Parse("application/octet-stream");

            l_objResponse.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment");
            l_objResponse.Content.Headers.ContentDisposition.FileName = p_strFileName;

            return l_objResponse;
        }

        protected HttpResponseMessage GetFileResponseForView(byte[] p_objFileContent, string p_strFileName)
        {
            string l_strContentType = GetContentType(p_strFileName);
            var l_objResponse = new HttpResponseMessage(HttpStatusCode.OK);
            l_objResponse.Content = new StreamContent(new MemoryStream(p_objFileContent));
            l_objResponse.Content.Headers.ContentType = MediaTypeHeaderValue.Parse(l_strContentType);

            if (l_strContentType == "application/octet-stream")
            {
                l_objResponse.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment");
                l_objResponse.Content.Headers.ContentDisposition.FileName = p_strFileName;
            }

            return l_objResponse;
        }

        protected HttpResponseMessage GetFileNotFoundResponse()
        {
            var l_objResponse = new HttpResponseMessage(HttpStatusCode.NotFound);
            return l_objResponse;
        }

        protected HttpResponseMessage GetForbiddenResponse()
        {
            var l_objResponse = new HttpResponseMessage(HttpStatusCode.Forbidden);
            return l_objResponse;
        }

        protected HttpResponseMessage GetBadRequestResponse()
        {
            var l_objResponse = new HttpResponseMessage(HttpStatusCode.BadRequest);
            return l_objResponse;
        }
    }

}
