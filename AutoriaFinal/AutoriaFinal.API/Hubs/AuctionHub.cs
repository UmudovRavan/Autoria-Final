using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace AutoriaFinal.API.Hubs
{
    public class AuctionHub : Hub
    {
        private readonly ILogger<AuctionHub> _logger;
        private const string AuctionGroupPrefix = "auction-";

        public AuctionHub(ILogger<AuctionHub> logger)
        {
            _logger = logger;
        }

        public async Task JoinAuction(Guid auctionId)
        {
            var userId = GetCurrentUserId();
            await Groups.AddToGroupAsync(Context.ConnectionId, $"{AuctionGroupPrefix}{auctionId}");
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user-{userId}");

            await Clients.Caller.SendAsync("JoinedAuction", auctionId);
            _logger.LogInformation("User {UserId} joined auction {AuctionId}", userId, auctionId);
        }

        public async Task LeaveAuction(Guid auctionId)
        {
            var userId = GetCurrentUserId();
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"{AuctionGroupPrefix}{auctionId}");
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user-{userId}");

            await Clients.Caller.SendAsync("LeftAuction", auctionId);
            _logger.LogInformation("User {UserId} left auction {AuctionId}", userId, auctionId);
        }

        public async Task GetAuctionStatus(Guid auctionId)
        {
            await Clients.Caller.SendAsync("AuctionStatusRequested", auctionId);
        }

        public override async Task OnConnectedAsync()
        {
            var userId = GetCurrentUserId();
            _logger.LogInformation("User connected: {ConnectionId}, UserId: {UserId}", Context.ConnectionId, userId);
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = GetCurrentUserId();
            _logger.LogInformation("Client disconnected: {ConnectionId}, UserId: {UserId}, Reason: {Reason}",
                Context.ConnectionId, userId, exception?.Message ?? "No reason");
            await base.OnDisconnectedAsync(exception);
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
        }
    }
}