using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NhyiraHaven.Migrations
{
    /// <inheritdoc />
    public partial class AddDonorUserLink : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "Supporters",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Supporters_UserId",
                table: "Supporters",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Supporters_AspNetUsers_UserId",
                table: "Supporters",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Supporters_AspNetUsers_UserId",
                table: "Supporters");

            migrationBuilder.DropIndex(
                name: "IX_Supporters_UserId",
                table: "Supporters");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Supporters");
        }
    }
}
