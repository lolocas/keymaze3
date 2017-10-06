using System.Runtime.Serialization;

namespace KeymazeLocal.Model
{
    [DataContract]
    public class Sport
    {
        [DataMember]
        public int P_primaire { get; set; }
        [DataMember]
        public string P_sport { get; set; }
    }
}
