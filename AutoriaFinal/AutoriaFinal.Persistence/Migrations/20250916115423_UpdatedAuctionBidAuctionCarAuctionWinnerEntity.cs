using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutoriaFinal.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedAuctionBidAuctionCarAuctionWinnerEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AuctionWinners_AuctionCars_AuctionCarId",
                table: "AuctionWinners");

            migrationBuilder.DropForeignKey(
                name: "FK_AuctionWinners_Bids_WinningBidId",
                table: "AuctionWinners");

            migrationBuilder.DropIndex(
                name: "IX_Auctions_LocationId",
                table: "Auctions");

            migrationBuilder.RenameIndex(
                name: "IX_AuctionWinners_AuctionCarId",
                table: "AuctionWinners",
                newName: "IX_AuctionWinner_AuctionCarId_Unique");

            migrationBuilder.AlterTable(
                name: "AuctionWinners",
                comment: "Auction qaliblərinin məlumatları və payment tracking");

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                table: "Bids",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "BidType",
                table: "Bids",
                type: "int",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<string>(
                name: "IPAddress",
                table: "Bids",
                type: "nvarchar(45)",
                maxLength: 45,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsAutoBid",
                table: "Bids",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "Bids",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ParentBidId",
                table: "Bids",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ProcessedAt",
                table: "Bids",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SequenceNumber",
                table: "Bids",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "UserAgent",
                table: "Bids",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ValidUntil",
                table: "Bids",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "AssignedAt",
                table: "AuctionWinners",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(2025, 9, 16, 11, 54, 23, 19, DateTimeKind.Utc).AddTicks(6019),
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AddColumn<Guid>(
                name: "ConfirmedByUserId",
                table: "AuctionWinners",
                type: "uniqueidentifier",
                nullable: true,
                comment: "Seller user ID - kim təsdiqləyib");

            migrationBuilder.AddColumn<bool>(
                name: "IsSecondChanceWinner",
                table: "AuctionWinners",
                type: "bit",
                nullable: false,
                defaultValue: false,
                comment: "İkinci şans winner-idir");

            migrationBuilder.AddColumn<DateTime>(
                name: "LastPaymentReminderSent",
                table: "AuctionWinners",
                type: "datetime2",
                nullable: true,
                comment: "Son payment reminder tarixi");

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "AuctionWinners",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true,
                comment: "Audit trail və əlavə qeydlər");

            migrationBuilder.AddColumn<Guid>(
                name: "OriginalWinnerId",
                table: "AuctionWinners",
                type: "uniqueidentifier",
                nullable: true,
                comment: "Əvvəlki winner ID (second chance üçün)");

            migrationBuilder.AddColumn<DateTime>(
                name: "PaymentDueDate",
                table: "AuctionWinners",
                type: "datetime2",
                nullable: true,
                comment: "Ödəniş son tarixi");

            migrationBuilder.AddColumn<string>(
                name: "PaymentReference",
                table: "AuctionWinners",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                comment: "Bank reference, transaction ID");

            migrationBuilder.AddColumn<int>(
                name: "PaymentReminderCount",
                table: "AuctionWinners",
                type: "int",
                nullable: false,
                defaultValue: 0,
                comment: "Göndərilmiş reminder sayı");

            migrationBuilder.AddColumn<string>(
                name: "RejectionReason",
                table: "AuctionWinners",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                comment: "Winner rədd edilmə səbəbi");

            migrationBuilder.AddColumn<DateTime>(
                name: "WinnerConfirmedAt",
                table: "AuctionWinners",
                type: "datetime2",
                nullable: true,
                comment: "Seller tərəfindən təsdiq edildiyi tarix");

            migrationBuilder.AddColumn<string>(
                name: "CurrentCarLotNumber",
                table: "Auctions",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CurrentCarStartTime",
                table: "Auctions",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ExtendedCount",
                table: "Auctions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsLive",
                table: "Auctions",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "MaxCarDurationMinutes",
                table: "Auctions",
                type: "int",
                nullable: false,
                defaultValue: 30);

            migrationBuilder.AddColumn<DateTime>(
                name: "ActiveStartTime",
                table: "AuctionCars",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "BidCount",
                table: "AuctionCars",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "AuctionCars",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastBidTime",
                table: "AuctionCars",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "SoldPrice",
                table: "AuctionCars",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "LotMedia",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AuctionCarId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Url = table.Column<string>(type: "nvarchar(1024)", maxLength: 1024, nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    ContentType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    IsPrimary = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LotMedia", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Bids_AuctionCarId_Amount",
                table: "Bids",
                columns: new[] { "AuctionCarId", "Amount" });

            migrationBuilder.CreateIndex(
                name: "IX_Bids_AuctionCarId_IsPreBid",
                table: "Bids",
                columns: new[] { "AuctionCarId", "IsPreBid" });

            migrationBuilder.CreateIndex(
                name: "IX_Bids_AuctionCarId_PlacedAtUtc",
                table: "Bids",
                columns: new[] { "AuctionCarId", "PlacedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_Bids_AuctionCarId_Status_Amount",
                table: "Bids",
                columns: new[] { "AuctionCarId", "Status", "Amount" });

            migrationBuilder.CreateIndex(
                name: "IX_Bids_BidType",
                table: "Bids",
                column: "BidType");

            migrationBuilder.CreateIndex(
                name: "IX_Bids_ParentBidId",
                table: "Bids",
                column: "ParentBidId");

            migrationBuilder.CreateIndex(
                name: "IX_Bids_Status",
                table: "Bids",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Bids_UserId_AuctionCarId_Status",
                table: "Bids",
                columns: new[] { "UserId", "AuctionCarId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Bids_UserId_PlacedAtUtc",
                table: "Bids",
                columns: new[] { "UserId", "PlacedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_Bids_ValidUntil",
                table: "Bids",
                column: "ValidUntil");

            migrationBuilder.CreateIndex(
                name: "IX_AuctionWinner_Amount_Status",
                table: "AuctionWinners",
                columns: new[] { "Amount", "PaymentStatus" });

            migrationBuilder.CreateIndex(
                name: "IX_AuctionWinner_ConfirmedAt",
                table: "AuctionWinners",
                column: "WinnerConfirmedAt",
                filter: "WinnerConfirmedAt IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AuctionWinner_PaymentDueDate",
                table: "AuctionWinners",
                column: "PaymentDueDate");

            migrationBuilder.CreateIndex(
                name: "IX_AuctionWinner_PaymentStatus",
                table: "AuctionWinners",
                column: "PaymentStatus");

            migrationBuilder.CreateIndex(
                name: "IX_AuctionWinner_PaymentStatus_DueDate",
                table: "AuctionWinners",
                columns: new[] { "PaymentStatus", "PaymentDueDate" },
                filter: "PaymentStatus IN (0, 3)");

            migrationBuilder.CreateIndex(
                name: "IX_AuctionWinner_Reminder_System",
                table: "AuctionWinners",
                columns: new[] { "PaymentStatus", "LastPaymentReminderSent" },
                filter: "PaymentStatus IN (0, 3)");

            migrationBuilder.CreateIndex(
                name: "IX_AuctionWinner_SecondChance",
                table: "AuctionWinners",
                columns: new[] { "IsSecondChanceWinner", "OriginalWinnerId" },
                filter: "IsSecondChanceWinner = 1");

            migrationBuilder.CreateIndex(
                name: "IX_AuctionWinner_User_Status_Date",
                table: "AuctionWinners",
                columns: new[] { "UserId", "PaymentStatus", "AssignedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_AuctionWinner_UserId",
                table: "AuctionWinners",
                column: "UserId");

            migrationBuilder.AddCheckConstraint(
                name: "CK_AuctionWinner_Amount_Positive",
                table: "AuctionWinners",
                sql: "Amount > 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_AuctionWinner_ConfirmedDate_Valid",
                table: "AuctionWinners",
                sql: "WinnerConfirmedAt IS NULL OR WinnerConfirmedAt >= AssignedAt");

            migrationBuilder.AddCheckConstraint(
                name: "CK_AuctionWinner_PaidAmount_Valid",
                table: "AuctionWinners",
                sql: "PaidAmount IS NULL OR (PaidAmount >= 0 AND PaidAmount <= Amount)");

            migrationBuilder.AddCheckConstraint(
                name: "CK_AuctionWinner_PaymentDueDate_Valid",
                table: "AuctionWinners",
                sql: "PaymentDueDate IS NULL OR PaymentDueDate >= AssignedAt");

            migrationBuilder.AddCheckConstraint(
                name: "CK_AuctionWinner_PaymentReminderCount_Valid",
                table: "AuctionWinners",
                sql: "PaymentReminderCount >= 0");

            migrationBuilder.CreateIndex(
                name: "IX_Auctions_IsLive",
                table: "Auctions",
                column: "IsLive");

            migrationBuilder.CreateIndex(
                name: "IX_Auctions_LocationId_Status",
                table: "Auctions",
                columns: new[] { "LocationId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Auctions_StartTimeUtc",
                table: "Auctions",
                column: "StartTimeUtc");

            migrationBuilder.CreateIndex(
                name: "IX_Auctions_Status",
                table: "Auctions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_AuctionCars_IsActive",
                table: "AuctionCars",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_AuctionCars_LastBidTime",
                table: "AuctionCars",
                column: "LastBidTime");

            migrationBuilder.CreateIndex(
                name: "IX_LotMedia_AuctionCarId",
                table: "LotMedia",
                column: "AuctionCarId");

            migrationBuilder.CreateIndex(
                name: "IX_LotMedia_AuctionCarId_SortOrder",
                table: "LotMedia",
                columns: new[] { "AuctionCarId", "SortOrder" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_AuctionWinner_AuctionCar",
                table: "AuctionWinners",
                column: "AuctionCarId",
                principalTable: "AuctionCars",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AuctionWinner_Bid",
                table: "AuctionWinners",
                column: "WinningBidId",
                principalTable: "Bids",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Bids_Bids_ParentBidId",
                table: "Bids",
                column: "ParentBidId",
                principalTable: "Bids",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AuctionWinner_AuctionCar",
                table: "AuctionWinners");

            migrationBuilder.DropForeignKey(
                name: "FK_AuctionWinner_Bid",
                table: "AuctionWinners");

            migrationBuilder.DropForeignKey(
                name: "FK_Bids_Bids_ParentBidId",
                table: "Bids");

            migrationBuilder.DropTable(
                name: "LotMedia");

            migrationBuilder.DropIndex(
                name: "IX_Bids_AuctionCarId_Amount",
                table: "Bids");

            migrationBuilder.DropIndex(
                name: "IX_Bids_AuctionCarId_IsPreBid",
                table: "Bids");

            migrationBuilder.DropIndex(
                name: "IX_Bids_AuctionCarId_PlacedAtUtc",
                table: "Bids");

            migrationBuilder.DropIndex(
                name: "IX_Bids_AuctionCarId_Status_Amount",
                table: "Bids");

            migrationBuilder.DropIndex(
                name: "IX_Bids_BidType",
                table: "Bids");

            migrationBuilder.DropIndex(
                name: "IX_Bids_ParentBidId",
                table: "Bids");

            migrationBuilder.DropIndex(
                name: "IX_Bids_Status",
                table: "Bids");

            migrationBuilder.DropIndex(
                name: "IX_Bids_UserId_AuctionCarId_Status",
                table: "Bids");

            migrationBuilder.DropIndex(
                name: "IX_Bids_UserId_PlacedAtUtc",
                table: "Bids");

            migrationBuilder.DropIndex(
                name: "IX_Bids_ValidUntil",
                table: "Bids");

            migrationBuilder.DropIndex(
                name: "IX_AuctionWinner_Amount_Status",
                table: "AuctionWinners");

            migrationBuilder.DropIndex(
                name: "IX_AuctionWinner_ConfirmedAt",
                table: "AuctionWinners");

            migrationBuilder.DropIndex(
                name: "IX_AuctionWinner_PaymentDueDate",
                table: "AuctionWinners");

            migrationBuilder.DropIndex(
                name: "IX_AuctionWinner_PaymentStatus",
                table: "AuctionWinners");

            migrationBuilder.DropIndex(
                name: "IX_AuctionWinner_PaymentStatus_DueDate",
                table: "AuctionWinners");

            migrationBuilder.DropIndex(
                name: "IX_AuctionWinner_Reminder_System",
                table: "AuctionWinners");

            migrationBuilder.DropIndex(
                name: "IX_AuctionWinner_SecondChance",
                table: "AuctionWinners");

            migrationBuilder.DropIndex(
                name: "IX_AuctionWinner_User_Status_Date",
                table: "AuctionWinners");

            migrationBuilder.DropIndex(
                name: "IX_AuctionWinner_UserId",
                table: "AuctionWinners");

            migrationBuilder.DropCheckConstraint(
                name: "CK_AuctionWinner_Amount_Positive",
                table: "AuctionWinners");

            migrationBuilder.DropCheckConstraint(
                name: "CK_AuctionWinner_ConfirmedDate_Valid",
                table: "AuctionWinners");

            migrationBuilder.DropCheckConstraint(
                name: "CK_AuctionWinner_PaidAmount_Valid",
                table: "AuctionWinners");

            migrationBuilder.DropCheckConstraint(
                name: "CK_AuctionWinner_PaymentDueDate_Valid",
                table: "AuctionWinners");

            migrationBuilder.DropCheckConstraint(
                name: "CK_AuctionWinner_PaymentReminderCount_Valid",
                table: "AuctionWinners");

            migrationBuilder.DropIndex(
                name: "IX_Auctions_IsLive",
                table: "Auctions");

            migrationBuilder.DropIndex(
                name: "IX_Auctions_LocationId_Status",
                table: "Auctions");

            migrationBuilder.DropIndex(
                name: "IX_Auctions_StartTimeUtc",
                table: "Auctions");

            migrationBuilder.DropIndex(
                name: "IX_Auctions_Status",
                table: "Auctions");

            migrationBuilder.DropIndex(
                name: "IX_AuctionCars_IsActive",
                table: "AuctionCars");

            migrationBuilder.DropIndex(
                name: "IX_AuctionCars_LastBidTime",
                table: "AuctionCars");

            migrationBuilder.DropColumn(
                name: "BidType",
                table: "Bids");

            migrationBuilder.DropColumn(
                name: "IPAddress",
                table: "Bids");

            migrationBuilder.DropColumn(
                name: "IsAutoBid",
                table: "Bids");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "Bids");

            migrationBuilder.DropColumn(
                name: "ParentBidId",
                table: "Bids");

            migrationBuilder.DropColumn(
                name: "ProcessedAt",
                table: "Bids");

            migrationBuilder.DropColumn(
                name: "SequenceNumber",
                table: "Bids");

            migrationBuilder.DropColumn(
                name: "UserAgent",
                table: "Bids");

            migrationBuilder.DropColumn(
                name: "ValidUntil",
                table: "Bids");

            migrationBuilder.DropColumn(
                name: "ConfirmedByUserId",
                table: "AuctionWinners");

            migrationBuilder.DropColumn(
                name: "IsSecondChanceWinner",
                table: "AuctionWinners");

            migrationBuilder.DropColumn(
                name: "LastPaymentReminderSent",
                table: "AuctionWinners");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "AuctionWinners");

            migrationBuilder.DropColumn(
                name: "OriginalWinnerId",
                table: "AuctionWinners");

            migrationBuilder.DropColumn(
                name: "PaymentDueDate",
                table: "AuctionWinners");

            migrationBuilder.DropColumn(
                name: "PaymentReference",
                table: "AuctionWinners");

            migrationBuilder.DropColumn(
                name: "PaymentReminderCount",
                table: "AuctionWinners");

            migrationBuilder.DropColumn(
                name: "RejectionReason",
                table: "AuctionWinners");

            migrationBuilder.DropColumn(
                name: "WinnerConfirmedAt",
                table: "AuctionWinners");

            migrationBuilder.DropColumn(
                name: "CurrentCarLotNumber",
                table: "Auctions");

            migrationBuilder.DropColumn(
                name: "CurrentCarStartTime",
                table: "Auctions");

            migrationBuilder.DropColumn(
                name: "ExtendedCount",
                table: "Auctions");

            migrationBuilder.DropColumn(
                name: "IsLive",
                table: "Auctions");

            migrationBuilder.DropColumn(
                name: "MaxCarDurationMinutes",
                table: "Auctions");

            migrationBuilder.DropColumn(
                name: "ActiveStartTime",
                table: "AuctionCars");

            migrationBuilder.DropColumn(
                name: "BidCount",
                table: "AuctionCars");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "AuctionCars");

            migrationBuilder.DropColumn(
                name: "LastBidTime",
                table: "AuctionCars");

            migrationBuilder.DropColumn(
                name: "SoldPrice",
                table: "AuctionCars");

            migrationBuilder.RenameIndex(
                name: "IX_AuctionWinner_AuctionCarId_Unique",
                table: "AuctionWinners",
                newName: "IX_AuctionWinners_AuctionCarId");

            migrationBuilder.AlterTable(
                name: "AuctionWinners",
                oldComment: "Auction qaliblərinin məlumatları və payment tracking");

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                table: "Bids",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int",
                oldDefaultValue: 0);

            migrationBuilder.AlterColumn<DateTime>(
                name: "AssignedAt",
                table: "AuctionWinners",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValue: new DateTime(2025, 9, 16, 11, 54, 23, 19, DateTimeKind.Utc).AddTicks(6019));

            migrationBuilder.CreateIndex(
                name: "IX_Auctions_LocationId",
                table: "Auctions",
                column: "LocationId");

            migrationBuilder.AddForeignKey(
                name: "FK_AuctionWinners_AuctionCars_AuctionCarId",
                table: "AuctionWinners",
                column: "AuctionCarId",
                principalTable: "AuctionCars",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AuctionWinners_Bids_WinningBidId",
                table: "AuctionWinners",
                column: "WinningBidId",
                principalTable: "Bids",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
