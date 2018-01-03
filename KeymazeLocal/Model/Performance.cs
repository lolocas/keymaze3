using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace KeymazeLocal.Model
{
    public class Performance
    {
        [DataMember]
        public int K_primaire { get; set; }
        [DataMember]
        public string P_sport { get; set; }
        [DataMember]
        public string L_lieu { get; set; }
        [DataMember]
        public string S_lieu { get; set; }
        [DataMember]
        public string T_type { get; set; }
        [DataMember]
        public Nullable<double> T_couleur { get; set; }
        [DataMember]
        public Nullable<DateTime> K_date_perf { get; set; }
        [DataMember]
        public Nullable<double> K_temps { get; set; }
        [DataMember]
        public Nullable<double> K_distance { get; set; }
        [DataMember]
        public Nullable<decimal> K_vitmoy { get; set; }
        [DataMember]
        public Nullable<double> K_vitmax { get; set; }
        [DataMember]
        public string K_comment { get; set; }
        [DataMember]
        public string K_wp { get; set; }
        [DataMember]
        public string K_gps { get; set; }
        [DataMember]
        public string K_url { get; set; }
        [DataMember]
        public Nullable<int> K_Key_Sport { get; set; }
        [DataMember]
        public Nullable<int> K_Key_Lieu { get; set; }
        [DataMember]
        public Nullable<int> K_Key_Souslieu { get; set; }
        [DataMember]
        public Nullable<int> K_Key_Type { get; set; }
        [DataMember]
        public Nullable<double> K_cadmoy { get; set; }
        [DataMember]
        public Nullable<double> K_cadmax { get; set; }
        [DataMember]
        public Nullable<double> K_fcmoy { get; set; }
        [DataMember]
        public Nullable<double> K_fcmax { get; set; }
        [DataMember]
        public Nullable<double> K_kcal { get; set; }
    }
}
