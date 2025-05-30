namespace CardsAngular.Model.DTO;

public record MessageDTO(
    string Id, 
    string UserId,
    string Created,
    string Content,
    bool IsSystemLog = false
);