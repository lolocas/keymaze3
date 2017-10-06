using System.Runtime.Serialization;

namespace KeymazeLocal.Model
{
    public class Lieu
    {
        [DataMember]
        public int L_primaire { get; set; }
        [DataMember]
        public string L_lieu { get; set; }
    }
}
