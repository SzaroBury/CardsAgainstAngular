using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using CardsAngular.Model;
using CardsAngular.Services.Contracts;
using CardsAngular.Services;
using CardsAngular.Hubs;
using CardsAngular.Middleware;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<CardsContext>(options => options.UseInMemoryDatabase("CardsCB"));
builder.Services.AddSingleton<IUserService, UserService>();
builder.Services.AddSingleton<IRoomService, RoomService>();
builder.Services.AddSingleton<IDeckService, DeckService>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IGameService, GameService>();
builder.Services.AddSignalR();
builder.Services.AddCors(options => 
{
    options.AddDefaultPolicy(
        builder => {
            builder.WithOrigins("https://localhost:44459")
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
        });
});
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            Console.WriteLine($"{DateTime.Now}: Authentication failed: {context.Exception.Message}");
            return Task.CompletedTask;
        },
        OnChallenge = context =>
        {
            Console.WriteLine($"{DateTime.Now}: JWT challenge triggered");
            return Task.CompletedTask;
        }
    };

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = "id.cardsagainstangular.com",
        ValidateAudience = true,
        ValidAudience = "cardsagainstangular.com",
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("some-very-secret-and-very-long-key-to-store-safely")),
        ValidateLifetime = true
    };
});

var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();

if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}
app.UseSwagger();
app.UseSwaggerUI();
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseCors();

app.UseAuthentication(); 
app.UseAuthorization();

app.UseWebSockets(new WebSocketOptions
{
    KeepAliveInterval = TimeSpan.FromSeconds(120)
});

app.MapHub<RoomHub>("api/hub/room");
app.MapControllers();
app.MapFallbackToFile("index.html");

app.Run();
