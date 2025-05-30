namespace CardsAngular.Model.Entities;

public class Sentence
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Value { get; set; } = "";
    public int BlankFields { get; set; } = 0;

    public Sentence(string value)
    {
        Value = value;
        BlankFields = value.Count(c => c == '_');
    }
    public Sentence(string value, int blankFields)
    {
        Value = value;
        BlankFields = blankFields;
    }
}