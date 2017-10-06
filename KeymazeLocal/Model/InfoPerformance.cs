using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;

namespace KeymazeLocal.Model
{
    public class InfoPerformance
    {
        [DataMember]
        public List<Lieu> ListeLieux { get; set; }
        [DataMember]
        public List<SousLieu> ListeSousLieux { get; set; }
        [DataMember]
        public List<Sport> ListeSports { get; set; }
        [DataMember]
        public List<TypePerformance> ListeTypePerformances { get; set; }
    }
}
