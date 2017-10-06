using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.ServiceModel;
using System.ServiceModel.Channels;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.SelfHost;
using System.Web.Http.SelfHost.Channels;

namespace KeymazeLocal
{
    public class WebServer
    {
        public class HttpsSelfHostConfiguration : HttpSelfHostConfiguration
        {
            public HttpsSelfHostConfiguration(string baseAddress)
                : base(baseAddress)
            {
            }

            public HttpsSelfHostConfiguration(Uri baseAddress)
                : base(baseAddress)
            {
            }

            protected override BindingParameterCollection OnConfigureBinding(HttpBinding httpBinding)
            {
                httpBinding.Security.Mode = HttpBindingSecurityMode.Transport;
                return base.OnConfigureBinding(httpBinding);
            }
        }

        public static HttpSelfHostServer Start(string p_strExposeUrl)
        {
            return Start(p_strExposeUrl, new List<DelegatingHandler>());
        }

        public static HttpSelfHostServer Start(string p_strExposeUrl, HostNameComparisonMode p_objHostNameComparisonMode)
        {
            return Start(p_strExposeUrl, new List<DelegatingHandler>(), p_objHostNameComparisonMode);
        }

        public static HttpSelfHostServer Start(string p_strExposeUrl, DelegatingHandler p_objHandler)
        {
            return Start(p_strExposeUrl, new List<DelegatingHandler>() { p_objHandler });
        }

        public static HttpSelfHostServer Start(string p_strExposeUrl, DelegatingHandler p_objHandler, HostNameComparisonMode p_objHostNameComparisonMode)
        {
            return Start(p_strExposeUrl, new List<DelegatingHandler>() { p_objHandler }, p_objHostNameComparisonMode);
        }

        public static HttpSelfHostServer Start(string p_strExposeUrl, IEnumerable<DelegatingHandler> p_objHandlers)
        {
            return Start(p_strExposeUrl, p_objHandlers, System.ServiceModel.HostNameComparisonMode.StrongWildcard);
        }

        public static HttpSelfHostServer Start(string p_strExposeUrl, IEnumerable<DelegatingHandler> p_objHandlers, HostNameComparisonMode p_objHostNameComparisonMode)
        {
            string l_strExposeUrl = p_strExposeUrl + (!p_strExposeUrl.EndsWith("/") ? "/" : string.Empty);
            var l_objConfig = new HttpSelfHostConfiguration(l_strExposeUrl);
            if (l_strExposeUrl.Trim().ToLower().StartsWith("https://"))
                l_objConfig = new HttpsSelfHostConfiguration(l_strExposeUrl);

            l_objConfig.HostNameComparisonMode = p_objHostNameComparisonMode;

            l_objConfig.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{action}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );

            var jsonFormatter = l_objConfig.Formatters.OfType<JsonMediaTypeFormatter>().FirstOrDefault();
            if (jsonFormatter != null)
            {
                jsonFormatter.SerializerSettings.ContractResolver = new CamelCaseContractResolver();
            }
            l_objConfig.MaxReceivedMessageSize = int.MaxValue;
            l_objConfig.MaxBufferSize = int.MaxValue;

            l_objConfig.MessageHandlers.Add(new CorsHandler());
            if (p_objHandlers != null)
            {
                foreach (var l_objHandler in p_objHandlers)
                {
                    l_objConfig.MessageHandlers.Add(l_objHandler);
                }
            }

            var l_objServer = new HttpSelfHostServer(l_objConfig);
            l_objServer.OpenAsync().Wait();

            return l_objServer;
        }

        public static void Stop(HttpSelfHostServer p_objServer)
        {
            if (p_objServer != null)
                p_objServer.CloseAsync().Wait();
        }
    }

    public class CamelCaseContractResolver : CamelCasePropertyNamesContractResolver
    {
        //Exception pour les dictionary
        protected override JsonDictionaryContract CreateDictionaryContract(Type objectType)
        {
            JsonDictionaryContract contract = base.CreateDictionaryContract(objectType);
            contract.PropertyNameResolver = propertyName => propertyName;
            return contract;
        }
    }

    public class CorsHandler : DelegatingHandler
    {
        private bool IsCorsRequest(HttpRequestMessage request)
        {
            return request.Headers.Contains("Origin") || request.Headers.Contains("origin");
        }

        private bool IsOptionsRequest(HttpRequestMessage request)
        {
            return request.Method == HttpMethod.Options;
        }

        private string GetRequestMethod(HttpRequestMessage request)
        {
            if (request.Method == HttpMethod.Options)
                return "OPTIONS";
            else if (request.Method == HttpMethod.Get)
                return "GET";
            else if (request.Method == HttpMethod.Post)
                return "POST";
            else if (request.Method == HttpMethod.Delete)
                return "DELETE";
            else if (request.Method == HttpMethod.Head)
                return "HEAD";
            else if (request.Method == HttpMethod.Put)
                return "PUT";
            else if (request.Method == HttpMethod.Trace)
                return "TRACE";
            else
                return "UNKNOWN";
        }

        private string GetRequestHeader(HttpRequestMessage request, string p_strKey)
        {
            var l_strValue = string.Empty;
            if (request.Headers.Contains(p_strKey))
                l_strValue = request.Headers.GetValues(p_strKey).First();
            else if (request.Headers.Contains(p_strKey.ToLower()))
                l_strValue = request.Headers.GetValues(p_strKey.ToLower()).First();
            return l_strValue;
        }

        private void AddCorsResponseHeaders(HttpRequestMessage request, HttpResponseMessage response)
        {
            if (IsCorsRequest(request))
            {
                //Récupération des Headers de la requete
                var l_strOrigin = GetRequestHeader(request, "Origin");
                var l_strAccessControlRequestMethod = string.Empty;
                var l_strAccessControlRequestHeaders = string.Empty;
                if (!string.IsNullOrWhiteSpace(l_strOrigin))
                {
                    if (IsOptionsRequest(request))
                    {
                        l_strAccessControlRequestMethod = GetRequestHeader(request, "Access-Control-Request-Method");
                        l_strAccessControlRequestHeaders = GetRequestHeader(request, "Access-Control-Request-Headers");
                    }
                }

                //Ajout des headers necessaires dans la response
                if (!string.IsNullOrWhiteSpace(l_strOrigin))
                    response.Headers.Add("Access-Control-Allow-Origin", l_strOrigin);

                if (!string.IsNullOrWhiteSpace(l_strAccessControlRequestMethod))
                    response.Headers.Add("Access-Control-Allow-Methods", l_strAccessControlRequestMethod);

                if (!string.IsNullOrWhiteSpace(l_strAccessControlRequestHeaders))
                    response.Headers.Add("Access-Control-Allow-Headers", l_strAccessControlRequestHeaders);
            }
        }

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            return base.SendAsync(request, cancellationToken).ContinueWith<HttpResponseMessage>(task =>
            {
                var response = task.Result;
                if (IsOptionsRequest(request))
                    response = new HttpResponseMessage(HttpStatusCode.NoContent);

                AddCorsResponseHeaders(request, response);
#if DEBUG
                Console.WriteLine(string.Format("{0} - {1} -> {2}", GetRequestMethod(request), request.RequestUri.LocalPath, response.StatusCode));
#endif
                return response;
            }, cancellationToken);
        }
    }

}
