using CollectionsApi;
using Dapper;
using Microsoft.Data.SqlClient;

var builder = WebApplication.CreateBuilder(args);

// 0. ADD THIS: Allow React (which usually runs on port 5173 for Vite or 3000 for Create-React-App)
// (CORS)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173", "http://localhost:3000") // Allow both common React ports
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

// 1. ADD THIS: Register Swagger Generators
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    // 2. ADD THIS: Enable the Swagger UI Middleware
    app.UseSwagger();
    app.UseSwaggerUI(); 
}

app.UseCors("AllowReactApp");

app.UseHttpsRedirection();

app.MapGet("/api/queue", async (IConfiguration config) =>
{
    // 1. Get the connection string from appsettings.json
    var connectionString = config.GetConnectionString("DefaultConnection");

    // 2. Create the SQL Connection
    using var connection = new SqlConnection(connectionString);

    // 3. Execute the Stored Procedure using Dapper
    // We tell Dapper to map the results to our 'DebtorViewModel' class
    var debtors = await connection.QueryAsync<DebtorViewModel>(
        "sp_GetPriorityQueue", 
        commandType: System.Data.CommandType.StoredProcedure
    );

    // 4. Return the list
    return Results.Ok(debtors);
})
.WithName("GetPriorityQueue");

app.MapPost("/api/queue/{id}/log", async (int id, CallLogRequest request, IConfiguration config) =>
{
    var connectionString = config.GetConnectionString("DefaultConnection");
    using var connection = new SqlConnection(connectionString);

    // TALKING POINT: Parametrized Queries prevent SQL Injection.
    // We don't strictly need a Stored Proc for simple inserts, so raw SQL via Dapper is fine here.
    var sql = @"
        INSERT INTO CallLogs (DebtorId, AgentNote, ResultCode, CreatedAt)
        VALUES (@DebtorId, @Note, @ResultCode, GETDATE())";

    // Dapper matches the @Params to the object properties automatically
    await connection.ExecuteAsync(sql, new 
    { 
        DebtorId = id, 
        Note = request.Note, 
        ResultCode = request.ResultCode 
    });

    return Results.Ok(new { message = "Call logged successfully" });
})
.WithName("LogCall");

app.Run();