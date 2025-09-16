using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutoriaFinal.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedBidAndAuctions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AuctionWinners_AuctionCars_AuctionCarId",
                table: "AuctionWinners");

            migrationBuilder.DropForeignKey(
                name: "FK_Bids_AuctionCars_AuctionCarId",
                table: "Bids");

            migrationBuilder.DropTable(
                name: "LotMedias");

            migrationBuilder.DropIndex(
                name: "IX_Bids_AuctionCarId_PlacedAtUtc",
                table: "Bids");

            migrationBuilder.AddColumn<bool>(
                name: "IsPreBid",
                table: "Bids",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "StartPrice",
                table: "Auctions",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TimerSeconds",
                table: "Auctions",
                type: "int",
                nullable: false,
                defaultValue: 10);

            migrationBuilder.AddColumn<decimal>(
                name: "MinPreBid",
                table: "AuctionCars",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateIndex(
                name: "IX_Bids_UserId",
                table: "Bids",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AuctionCars_CarId",
                table: "AuctionCars",
                column: "CarId");

            migrationBuilder.AddForeignKey(
                name: "FK_AuctionCars_Cars_CarId",
                table: "AuctionCars",
                column: "CarId",
                principalTable: "Cars",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AuctionWinners_AuctionCars_AuctionCarId",
                table: "AuctionWinners",
                column: "AuctionCarId",
                principalTable: "AuctionCars",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Bids_AuctionCars_AuctionCarId",
                table: "Bids",
                column: "AuctionCarId",
                principalTable: "AuctionCars",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AuctionCars_Cars_CarId",
                table: "AuctionCars");

            migrationBuilder.DropForeignKey(
                name: "FK_AuctionWinners_AuctionCars_AuctionCarId",
                table: "AuctionWinners");

            migrationBuilder.DropForeignKey(
                name: "FK_Bids_AuctionCars_AuctionCarId",
                table: "Bids");

            migrationBuilder.DropIndex(
                name: "IX_Bids_UserId",
                table: "Bids");

            migrationBuilder.DropIndex(
                name: "IX_AuctionCars_CarId",
                table: "AuctionCars");

            migrationBuilder.DropColumn(
                name: "IsPreBid",
                table: "Bids");

            migrationBuilder.DropColumn(
                name: "StartPrice",
                table: "Auctions");

            migrationBuilder.DropColumn(
                name: "TimerSeconds",
                table: "Auctions");

            migrationBuilder.DropColumn(
                name: "MinPreBid",
                table: "AuctionCars");

            migrationBuilder.CreateTable(
                name: "LotMedias",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AuctionCarId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ContentType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    IsPrimary = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    Type = table.Column<int>(type: "int", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Url = table.Column<string>(type: "nvarchar(1024)", maxLength: 1024, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LotMedias", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Bids_AuctionCarId_PlacedAtUtc",
                table: "Bids",
                columns: new[] { "AuctionCarId", "PlacedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_LotMedias_AuctionCarId",
                table: "LotMedias",
                column: "AuctionCarId");

            migrationBuilder.CreateIndex(
                name: "IX_LotMedias_AuctionCarId_SortOrder",
                table: "LotMedias",
                columns: new[] { "AuctionCarId", "SortOrder" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_AuctionWinners_AuctionCars_AuctionCarId",
                table: "AuctionWinners",
                column: "AuctionCarId",
                principalTable: "AuctionCars",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Bids_AuctionCars_AuctionCarId",
                table: "Bids",
                column: "AuctionCarId",
                principalTable: "AuctionCars",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
