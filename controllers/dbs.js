const postgresService = require("../services/databases/postgres")
const redisService = require("../services/databases/redis")
const mysqlService = require("../services/databases/mysql")
const mongoService = require("../services/databases/mongodb")
const mariadbService = require("../services/databases/mariadb")

//Fetch Databases
const dbs = async (req, res) => {

    try {
        const results = await Promise.all([
            postgresService(),
            mysqlService(),
            mongoService(),
            mariadbService(),
            redisService()
        ])

        // Flatten all database arrays into one
        const databases = results.flat().filter(Boolean)

        const runningStatuses = ["running", "active"]

        const runningEngines = databases.filter(db =>
            runningStatuses.includes(db.status)
        ).length

        const stoppedEngines = databases.length - runningEngines

        const uniqueEngines = [
            ...new Set(databases.map(db => db.engine))
        ].length

        return res.json({
            success: true,
            count: databases.length,
            summary: {
                totalEngines: databases.length,
                runningEngines,
                stoppedEngines,
                databaseTypes: uniqueEngines
            },
            databases
        })

    } catch (error) {
        console.error(error)

        return res.status(500).json({
            success: false,
            message: "Failed to discover databases."
        })
    }
}

module.exports = { dbs }