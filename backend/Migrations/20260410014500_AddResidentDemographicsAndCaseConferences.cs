using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace NhyiraHaven.Migrations
{
    /// <inheritdoc />
    public partial class AddResidentDemographicsAndCaseConferences : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AssignedSocialWorkers",
                table: "Residents",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DisabilityInfo",
                table: "Residents",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Is4PsBeneficiary",
                table: "Residents",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsIndigenous",
                table: "Residents",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsInformalSettler",
                table: "Residents",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsSoloParentChild",
                table: "Residents",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "CaseConferences",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ResidentId = table.Column<int>(type: "integer", nullable: false),
                    ConferenceDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ConferenceType = table.Column<string>(type: "text", nullable: false),
                    Facilitator = table.Column<string>(type: "text", nullable: true),
                    Attendees = table.Column<string>(type: "text", nullable: true),
                    Summary = table.Column<string>(type: "text", nullable: false),
                    Decisions = table.Column<string>(type: "text", nullable: true),
                    ActionItems = table.Column<string>(type: "text", nullable: true),
                    NextConferenceDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CaseConferences", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CaseConferences_Residents_ResidentId",
                        column: x => x.ResidentId,
                        principalTable: "Residents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CaseConferences_ResidentId",
                table: "CaseConferences",
                column: "ResidentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CaseConferences");

            migrationBuilder.DropColumn(
                name: "AssignedSocialWorkers",
                table: "Residents");

            migrationBuilder.DropColumn(
                name: "DisabilityInfo",
                table: "Residents");

            migrationBuilder.DropColumn(
                name: "Is4PsBeneficiary",
                table: "Residents");

            migrationBuilder.DropColumn(
                name: "IsIndigenous",
                table: "Residents");

            migrationBuilder.DropColumn(
                name: "IsInformalSettler",
                table: "Residents");

            migrationBuilder.DropColumn(
                name: "IsSoloParentChild",
                table: "Residents");
        }
    }
}
