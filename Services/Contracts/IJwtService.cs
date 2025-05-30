namespace CardsAngular.Services.Contracts;

public interface IJwtService 
{
    public string GenerateAccessToken(string userId, string userName);
    public string GenerateRefreshToken();
}