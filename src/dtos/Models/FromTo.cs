using System.Text;

namespace AesCloudDataNetNet.Models
{
    /// <summary>
    /// class for operate with From->To based operations 
    /// </summary>
    public class FromTo
    {
        public string From { get; set; }
        public string To { get; set; }

        public bool IsValid { get => !From.IsZ() && !To.IsZ(); }

       // public string Pair { get => ; }
        public FromTo ToLower()
        {
            From = From.ToLower();
            To = To.ToLower();
            return this;
        }
        public FromTo ToUpper()
        {
            From = From.ToUpper();
            To = To.ToUpper();
            return this;
        }
        public  string Pair
        {
            get => From + '-' + To; 
        }
     
        public string ToJson()
        {
            return $"{{from={From},to={To}}}";
        }
        public static string ArrayToDelim(FromTo[] arr,
                string delim = ",",
                string pairDelim = "-") 
        {
            StringBuilder sb = new StringBuilder();

            if (arr != null )
            {
                foreach (var item in arr)
                {
                    if (item.IsValid)
                    {
                        if (sb.Length <= 0)
                        {
                            sb.Append(delim);
                        }
                        sb.AppendFormat(item.From + pairDelim + item.To);

                    }

                }
      
            }
            return sb.ToString();
        }
    }
}
