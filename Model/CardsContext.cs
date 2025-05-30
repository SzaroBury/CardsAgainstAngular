using CardsAngular.Model.Entities;
using Microsoft.EntityFrameworkCore;

namespace CardsAngular.Model;

public class CardsContext : DbContext
{
    public DbSet<Room> Rooms { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Deck> Sets { get; set; }

    public CardsContext(DbContextOptions options) : base(options)
    {
    }
}