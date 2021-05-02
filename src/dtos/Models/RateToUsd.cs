using System;
using System.Text.Json.Serialization;

#nullable disable

namespace AesCloudDataNetNet.Models
{
    public partial class RateToUsd
    {
        private string code;
        [JsonIgnore]
        public int Id { get => code.GetHashCode(); set { } }
        public string Code { get =>  code; set =>  code = normCode( value); }
        public string Name { get; set; }
        public double Rate { get; set; }
        public double Bid { get; set; }
        public double Ask { get; set; }
        public DateTime Stored { get; set; }
        public DateTime LastRefreshed { get; set; }

        string normCode(string code) => (code ?? "").ToUpper().Substring(0, 3);

        public override int GetHashCode()
        {
            return base.GetHashCode();
        }
    }
}
