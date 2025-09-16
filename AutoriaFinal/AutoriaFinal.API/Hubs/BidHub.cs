using AutoriaFinal.Contract.Dtos.Auctions.Bid;
using AutoriaFinal.Contract.Services.Auctions;
using Microsoft.AspNetCore.SignalR;

namespace AutoriaFinal.API.Hubs
{
    public class BidHub : Hub
    {
        private readonly ILogger<BidHub> _logger;
        private readonly IBidService _bidService;
        private const string AuctionCarGroupPrefix = "AuctionCar-";
        public BidHub(ILogger<BidHub> logger, IBidService bidService)
        {
            _logger = logger;
            _bidService = bidService;
        }
        //Her hansi masinin AuctionCar real-time kanalina qosulur
        public async Task JoinAuctionCar(Guid auctionCarId, Guid userId, decimal amount)
        {
            var dto = new BidCreateDto
            {
                AuctionCarId = auctionCarId,
                UserId = userId,
                Amount = amount,
                IsPreBid = true
            };
            var result = await _bidService.PlaceBidAsync(dto);
            await Groups.AddToGroupAsync(Context.ConnectionId, $"{AuctionCarGroupPrefix}{auctionCarId}");
            await Clients.Caller.SendAsync("JoinedAuctionCar", auctionCarId, result.Amount);

            _logger.LogInformation("User {UserId} joined AuctionCar {AuctionCarId} with PreBid {Amount}",
                userId, auctionCarId, amount);
        }
        //Her hansi masinin AuctionCar real-time kanalindan cixir
        public async Task LeaveAuctionCar(Guid auctionCarId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"{AuctionCarGroupPrefix}{auctionCarId}");

            await Clients.Caller.SendAsync("LeftAuctionCar", auctionCarId);
        }
        public async Task PlaceLiveBid(BidCreateDto dto)
        {
            var result = await _bidService.PlaceBidAsync(dto);

            await Clients.Group($"{AuctionCarGroupPrefix}{dto.AuctionCarId}")
                .SendAsync("NewBidPlaced", result.AuctionCarId, result.UserId, result.Amount, result.PlacedAtUtc);

            await Clients.Group($"{AuctionCarGroupPrefix}{dto.AuctionCarId}")
                .SendAsync("HighestBidUpdated", result.AuctionCarId, result.Amount);

            _logger.LogInformation("Live bid placed by User {UserId} on AuctionCar {AuctionCarId} with {Amount}",
                dto.UserId, dto.AuctionCarId, dto.Amount);
        }



        public override async Task OnConnectedAsync()
        {
            _logger.LogInformation("Client connected: {ConnectionId}", Context.ConnectionId);
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
