using System.Runtime.Serialization;

namespace KeymazeLocal.Model
{
    [DataContract]
    public class SousLieu
    {
        [DataMember]
        public int S_primaire { get; set; }
        [DataMember]
        public int S_key_lieu { get; set; }
        [DataMember]
        public string S_lieu { get; set; }
    }
}
