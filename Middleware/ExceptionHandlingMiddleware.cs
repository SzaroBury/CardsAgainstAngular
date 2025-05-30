using System.Net;
using System.Security;
using System.Text.Json;

namespace CardsAngular.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch(ArgumentException ex)
        {
            var endpoint = context.GetEndpoint()?.DisplayName ?? context.Request.Path;
            _logger.LogWarning(ex, $"     {DateTime.Now}: {endpoint} - ArgumentException caught");

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;

            await context.Response.WriteAsync($"Invalid argument {ex.ParamName}: {ex.Message}");
        }
        catch(InvalidOperationException ex)
        {
            var endpoint = context.GetEndpoint()?.DisplayName ?? context.Request.Path;
            _logger.LogWarning(ex, $"     {DateTime.Now}: {endpoint} - InvalidOperationException caught");

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;

            await context.Response.WriteAsync($"Invalid operation: {ex.Message}");
        }
        catch (SecurityException ex)
        {
            var endpoint = context.GetEndpoint()?.DisplayName ?? context.Request.Path;
            _logger.LogWarning(ex, $"     {DateTime.Now}: {endpoint} - SecurityException caught");

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.Forbidden;

            await context.Response.WriteAsync($"Access rejected");
        }
        catch (KeyNotFoundException ex)
        {
            var endpoint = context.GetEndpoint()?.DisplayName ?? context.Request.Path;
            _logger.LogWarning(ex, $"     {DateTime.Now}: {endpoint} - KeyNotFoundException caught");

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.NotFound;

            await context.Response.WriteAsync($"The given resource was not found: {ex.Message}");
        }  
        catch (Exception ex)
        {
            var endpoint = context.GetEndpoint()?.DisplayName ?? context.Request.Path;
            _logger.LogError(ex, $"{DateTime.Now}: {endpoint} - Unexepected error caught");

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

            await context.Response.WriteAsync("Unexpected error occured.");
        }
    }
}