namespace CardsAngular.Model.Entities;

public struct Message
{
    public string Id { get; set; } = "";
    public string UserId { get; set; } = "";
    public string Created { get; set; } = "";
    public string Content { get; set; } = "";
    public bool SystemLog { get; set; } = false;

    public Message(string userId, string content, bool systemLog = false, string? created = null)
    {
        UserId = userId;
        Content = content;
        SystemLog = systemLog;
        if( created == null  ) Created = DateTime.Now.ToString("HH:mm:ss");
        else Created = created;
    }

}