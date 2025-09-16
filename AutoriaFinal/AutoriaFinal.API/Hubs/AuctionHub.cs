using Microsoft.AspNetCore.SignalR;

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
            await Groups.AddToGroupAsync(Context.ConnectionId, $"{AuctionGroupPrefix}{auctionId}");
            _logger.LogInformation("User {ConnectionId} joined auction {AuctionId}", Context.ConnectionId, auctionId);
        }
        public async Task LeaveAuction(Guid auctionId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"{AuctionGroupPrefix}{auctionId}");
        }
        public async Task AuctionScheduled(Guid auctionId,DateTime startTimeUtc)
        {
            await Clients.Group($"{AuctionGroupPrefix}{auctionId}")
                .SendAsync("AuctionScheduled", auctionId, startTimeUtc);
            _logger.LogInformation("Auction {AuctionId} scheduled at {StartTimeUtc}", auctionId, startTimeUtc);
        }
        public async Task AuctionStarted(Guid auctionId,decimal startPrice)
        {
            await Clients.Group($"{AuctionGroupPrefix}{auctionId}")
                .SendAsync("AuctionStarted", auctionId, startPrice);
            _logger.LogInformation("Auction {AuctionId} started with start price {StartPrice}", auctionId, startPrice);
        }
        public async Task AuctionTimerUpdated(Guid auctionId, int remainingSeconds)
        {
            await Clients.Group($"{AuctionGroupPrefix}{auctionId}")
                .SendAsync("AuctionTimerUpdated", auctionId, remainingSeconds);
            _logger.LogDebug("Auction {AuctionId} timer updated: {Seconds} seconds left", auctionId, remainingSeconds);
        }
        public async Task AuctionExtended(Guid auctionId,DateTime newEndTimeUtc)
        {
            await Clients.Group($"{AuctionGroupPrefix}{auctionId}")
                .SendAsync("AuctionExtended", auctionId, newEndTimeUtc);
            _logger.LogInformation("Auction {AuctionId} extended to {NewEndTime}", auctionId, newEndTimeUtc);
        }
        public async Task AuctionEnded(Guid auctionId,Guid winnerUserId,decimal amount)
        {
            await Clients.Group($"{AuctionGroupPrefix}{auctionId}")
                .SendAsync("AuctionEnded", auctionId, winnerUserId, amount);
            _logger.LogInformation("Auction {AuctionId} ended. Winner: {UserId}, Amount: {Amount}",
                auctionId, winnerUserId, amount);
        }
        public async Task AuctionCancelled(Guid auctionId)
        {
            await Clients.Group($"{AuctionGroupPrefix}{auctionId}")
                .SendAsync("AuctionCancelled", auctionId);
            _logger.LogWarning("Auction {AuctionId} cancelled", auctionId);
        }
        public override async Task OnConnectedAsync()
        {
            _logger.LogInformation("User connected: {ConnectionId}", Context.ConnectionId);
            await base.OnConnectedAsync();
        }
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            _logger.LogInformation("Client disconnected: {ConnectionId}, Reason: {Reason}",
                Context.ConnectionId, exception?.Message ?? "No reason");
            await base.OnDisconnectedAsync(exception);
        }

    }
}
