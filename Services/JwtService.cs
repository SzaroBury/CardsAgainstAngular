using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CardsAngular.Services.Contracts;
using Microsoft.IdentityModel.Tokens;

public class JwtService: IJwtService
{
    private readonly string secretKey = "some-very-secret-and-very-long-key-to-store-safely";
    private readonly string issuer = "id.cardsagainstangular.com";
    private readonly string audience = "cardsagainstangular.com";

    public string GenerateAccessToken(string userId, string userName)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId),
            new Claim(JwtRegisteredClaimNames.UniqueName, userName),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(15), 
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        return Guid.NewGuid().ToString();
    }
}
