using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

#nullable disable

namespace AesCloudDataNetNet.Models
{
    public partial class User
    {
        private string name;
        private Guid? guid;

        [JsonIgnore]
        public int Id { get => this.GetHashCode(); set { } }
        public string Name { get => name; set => name = value; }
        public string Email { get; set; }
        public string Password { get; set; }
        public Guid? Guid { get => guid = guid ?? System.Guid.NewGuid(); set => guid = value; }
        public int Severity { get; set; }
        public override int GetHashCode()
        {
            return name.ToUpper().GetHashCode();
        }
    }
}
