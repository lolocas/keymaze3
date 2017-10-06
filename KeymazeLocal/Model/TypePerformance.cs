using System.Runtime.Serialization;

namespace KeymazeLocal.Model
{
    [DataContract]
    public class TypePerformance
    {
        [DataMember]
        public int T_primaire { get; set; }
        [DataMember]
        public string T_type { get; set; }
        [DataMember]
        public double T_couleur { get; set; }
    }
}
