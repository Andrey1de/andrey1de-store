using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

#nullable disable

namespace AesCloudDataNetNet.Models
{
    public partial class UserAction
    {
        private string user = "";
        private Guid guid = System.Guid.Empty;

        [JsonIgnore]
        public int Id { get => guid.GetHashCode(); set { } }
        public  Guid Guid{ get => 
                guid = (guid != System.Guid.Empty) ? guid : System.Guid.NewGuid();
                 set => guid = value; }
        public string Type { get; set; }
        public DateTime? NextActionDate { get; set; }
        public int UserId { get => user.ToUpper().GetHashCode(); }
        public string User { get => user; set => user = value; }
        public int? PriodSec { get; set; }
        public byte[] Blob { get; set; }
        public string Json { get; set; }
    }
}
