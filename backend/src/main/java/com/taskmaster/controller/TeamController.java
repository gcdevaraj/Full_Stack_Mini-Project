package com.taskmaster.controller;

import com.taskmaster.model.Team;
import com.taskmaster.model.TeamMember;
import com.taskmaster.service.TeamService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    @GetMapping
    public List<Team> getAllTeams() {
        return teamService.getAllTeams();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Team> getTeamById(@PathVariable Long id) {
        return teamService.getTeamById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Team createTeam(@RequestBody Team team) {
        return teamService.createTeam(team);
    }

    @PutMapping("/{id}")
    public Team updateTeam(@PathVariable Long id, @RequestBody Team team) {
        return teamService.updateTeam(id, team);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeam(@PathVariable Long id) {
        teamService.deleteTeam(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/members")
    public List<TeamMember> getAllMembers() {
        return teamService.getAllMembers();
    }

    @PostMapping("/{teamId}/members")
    public TeamMember addMember(@PathVariable Long teamId, @RequestBody TeamMember member) {
        return teamService.addMemberToTeam(teamId, member);
    }

    @DeleteMapping("/members/{memberId}")
    public ResponseEntity<Void> removeMember(@PathVariable Long memberId) {
        teamService.removeMember(memberId);
        return ResponseEntity.noContent().build();
    }
}
