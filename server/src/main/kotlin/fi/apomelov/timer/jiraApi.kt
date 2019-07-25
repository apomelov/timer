package fi.apomelov.timer

import com.github.kittinunf.fuel.Fuel
import com.github.kittinunf.fuel.core.Method.GET
import com.github.kittinunf.fuel.jackson.responseObject
import com.github.kittinunf.fuel.util.FuelRouting
import org.springframework.stereotype.Service

data class SearchResult(val total: Int, val issues: List<JiraIssue>)
data class IconAware(val name: String)
data class Fields(val summary: String, val issuetype: IconAware, val priority: IconAware)
data class JiraIssue(val key: String, val self: String, val fields: Fields)

sealed class JiraApiRouting : FuelRouting {
    override val basePath = "http://jira.leiki.com:8800/Jira/rest/api/2"
    override val headers = mapOf("Authorization" to "Basic YWxleGV5OldlbGNvbWVfdG9fT3BlbldheS4=")
    override val params = emptyList<Pair<String, String>>()
    override val method = GET
    override val body = null
    override val bytes = null
}

open class JiraSearchApi : JiraApiRouting() {
    override val path = "/search"
    companion object {
        fun search(query: String) = object : JiraSearchApi() {
            override val params = super.params +
                    Pair("fields", "summary,priority,issuetype") +
                    Pair("jql", "summary ~ \"$query\"")
        }
    }
}

@Service
class JiraApi {

    fun search(query: String) = Fuel
            .request(JiraSearchApi.search(query))
            .responseObject<SearchResult>()
            .third

}