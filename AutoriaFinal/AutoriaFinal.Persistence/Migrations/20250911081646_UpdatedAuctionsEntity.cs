using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutoriaFinal.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedAuctionsEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LotMedias_AuctionCars_AuctionCarId",
                table: "LotMedias");

            migrationBuilder.RenameColumn(
                name: "Winner",
                table: "AuctionCars",
                newName: "WinnerStatus");

            migrationBuilder.AddColumn<DateTime>(
                name: "AssignedAt",
                table: "AuctionWinners",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<decimal>(
                name: "PaidAmount",
                table: "AuctionWinners",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PaymentStatus",
                table: "AuctionWinners",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "Auctions",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "MinBidIncrement",
                table: "Auctions",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 100m);

            migrationBuilder.AlterColumn<int>(
                name: "ItemNumber",
                table: "AuctionCars",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldDefaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "CurrentPrice",
                table: "AuctionCars",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AssignedAt",
                table: "AuctionWinners");

            migrationBuilder.DropColumn(
                name: "PaidAmount",
                table: "AuctionWinners");

            migrationBuilder.DropColumn(
                name: "PaymentStatus",
                table: "AuctionWinners");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "Auctions");

            migrationBuilder.DropColumn(
                name: "MinBidIncrement",
                table: "Auctions");

            migrationBuilder.DropColumn(
                name: "CurrentPrice",
                table: "AuctionCars");

            migrationBuilder.RenameColumn(
                name: "WinnerStatus",
                table: "AuctionCars",
                newName: "Winner");

            migrationBuilder.AlterColumn<int>(
                name: "ItemNumber",
                table: "AuctionCars",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_LotMedias_AuctionCars_AuctionCarId",
                table: "LotMedias",
                column: "AuctionCarId",
                principalTable: "AuctionCars",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
