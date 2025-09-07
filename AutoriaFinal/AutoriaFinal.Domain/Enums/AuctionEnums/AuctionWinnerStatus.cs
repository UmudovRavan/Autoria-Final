using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoriaFinal.Domain.Enums.AuctionEnums
{
    public enum AuctionWinnerStatus
    {
        Pending,       // Qalib təyin olunub, amma təsdiq/proses hələ bitməyib
        Confirmed,     // Qalib rəsmi olaraq təsdiqlənib
        Rejected,      // Satıcı tərəfindən rədd edilib
        PaymentFailed, // Qalib ödəniş etmədi və ya uğursuz oldu
        Completed
    }
}
