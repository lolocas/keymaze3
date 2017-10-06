using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.Text;
using System.Threading.Tasks;

namespace KeymazeLocal
{
    class Program
    {
        static ServiceHost servicehost;
        static void Main(string[] args)
        {
#if DEBUG

            //string baseAddressHttp = "http://" + Environment.MachineName + ":80";
            //string baseAddressTcp = "net.tcp://" + Environment.MachineName + ":4528/Calculator";
            //ServiceHost host = new ServiceHost(typeof(Service), new Uri(baseAddressHttp), new Uri(baseAddressTcp));
            //host.AddServiceEndpoint(typeof(IService), new NetTcpBinding(SecurityMode.None), "");
            //host.AddServiceEndpoint(typeof(IClientAccessPolicy), new WebHttpBinding(), "").Behaviors.Add(new System.ServiceModel.Description.WebHttpBehavior());
            //System.ServiceModel.Description.ServiceMetadataBehavior smb = new System.ServiceModel.Description.ServiceMetadataBehavior();
            //host.Description.Behaviors.Add(smb);
            //smb.HttpGetEnabled = true;
            //host.AddServiceEndpoint(typeof(System.ServiceModel.Description.IMetadataExchange), System.ServiceModel.Description.MetadataExchangeBindings.CreateMexTcpBinding(), "mex");
            //host.Open();
            //Console.WriteLine("Host opened");
            //Console.Write("Press ENTER to close");
            //Console.ReadLine();
            //host.Close(); 

            Console.WriteLine("Starting host...");

            //Ajouter netsh http add urlacl url=http://+:80/ user=lca
            servicehost = new ServiceHost(typeof(Service));

            servicehost.Open();

            string p_strExposeUrl = "http://127.0.0.1:9101/local/";

            var l_objServer = WebServer.Start(p_strExposeUrl);
            var l_strMessage = string.Format("Serveur démarré : {0}", p_strExposeUrl);
            Console.WriteLine(l_strMessage);

            Console.WriteLine("Started.");

            Console.Write("Press <ENTER> to exit");
            Console.ReadLine();
            servicehost.Close();
#else
                ServiceBase.Run(new Program());
#endif
        }
    }
}
